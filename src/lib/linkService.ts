import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { LinkItem, UserProfile, SocialLinks } from "@/types/link";
import { getEmailPrefix } from "@/lib/utils";

/**
 * Firestore 개인화 경로 헬퍼: user/{uid}/links
 */
export const getUserLinksPath = (uid: string) => `user/${uid}/links`;

export const getUserLinksCollectionRef = (uid: string) => {
  return collection(db, "user", uid, "links");
};

export const getUserDocRef = (uid: string) => {
  return doc(db, "user", uid);
};

/**
 * Firestore 문서 데이터를 LinkItem 인터페이스로 변환
 */
function mapDocToLinkItem(docSnap: QueryDocumentSnapshot<DocumentData>): LinkItem {
  const data = docSnap.data();
  let createdAtStr = new Date().toISOString();
  if (typeof data.createdAt === "string") {
    createdAtStr = data.createdAt;
  } else if (data.createdAt?.toDate && typeof data.createdAt.toDate === "function") {
    createdAtStr = data.createdAt.toDate().toISOString();
  } else if (data.createdAt?.seconds) {
    createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
  }

  let updatedAtStr: string | undefined = undefined;
  if (typeof data.updatedAt === "string") {
    updatedAtStr = data.updatedAt;
  } else if (data.updatedAt?.toDate && typeof data.updatedAt.toDate === "function") {
    updatedAtStr = data.updatedAt.toDate().toISOString();
  } else if (data.updatedAt?.seconds) {
    updatedAtStr = new Date(data.updatedAt.seconds * 1000).toISOString();
  }

  return {
    id: docSnap.id,
    title: data.title || "",
    url: data.url || "",
    description: data.description || undefined,
    category: data.category || "projects",
    icon: data.icon || "link",
    active: data.active !== false,
    order: typeof data.order === "number" ? data.order : 0,
    createdAt: createdAtStr,
    updatedAt: updatedAtStr,
  };
}

/**
 * user/{uid} 경로에서 유저 프로필 조회
 */
export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try {
    const docRef = getUserDocRef(uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    const email = data.email || "";
    // 사용자가 직접 설정한 이름이 있으면 최우선 적용, 없을 때만 이메일 접두사/기본값 사용
    const displayName = (data.name as string)?.trim() || getEmailPrefix(email, "사용자");
    return {
      uid,
      name: displayName,
      email,
      bio: data.bio ?? "나만의 링크를 한곳에서 관리하고 공유해요.",
      avatarUrl: data.avatarUrl || "/profile.png",
      jobTitle: data.jobTitle || "마이페이지 회원",
      location: data.location || "대한민국",
      firestorePath: `user/${uid}/links`,
      isGoogleAuth: true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.warn("Failed to get user profile from Firestore:", error);
    return null;
  }
}

/**
 * Google 로그인 성공 시 user/{uid} 경로에 유저 프로필 동기화 및 저장
 */
export async function syncUserProfileToFirestore(authUser: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}): Promise<UserProfile> {
  const uid = authUser.uid;
  const now = new Date().toISOString();
  const email = authUser.email || "";
  const fallbackName = getEmailPrefix(email, authUser.displayName || "Google 사용자");

  const defaultProfile: UserProfile = {
    uid,
    name: fallbackName,
    email,
    avatarUrl: authUser.photoURL || "/profile.png",
    bio: "나만의 맞춤 링크를 한곳에서 관리하고 공유해요.",
    jobTitle: "마이페이지 회원",
    location: "대한민국",
    firestorePath: `user/${uid}/links`,
    isGoogleAuth: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = getUserDocRef(uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      // 최초 생성: Firestore user/{uid} 경로에 저장
      await setDoc(docRef, {
        ...defaultProfile,
        lastLoginAt: now,
      });
      return defaultProfile;
    } else {
      // 기존 문서가 존재하면 사용자가 설정해둔 기존 이름(name)을 유지
      const existing = snap.data();
      const preservedName = (existing.name as string)?.trim() || fallbackName;

      const updatedProfile: UserProfile = {
        uid,
        name: preservedName,
        email,
        avatarUrl: existing.avatarUrl || authUser.photoURL || "/profile.png",
        bio: existing.bio ?? "나만의 맞춤 링크를 한곳에서 관리하고 공유해요.",
        jobTitle: existing.jobTitle || "마이페이지 회원",
        location: existing.location || "대한민국",
        firestorePath: `user/${uid}/links`,
        isGoogleAuth: true,
        createdAt: existing.createdAt || now,
        updatedAt: now,
      };

      await setDoc(
        docRef,
        {
          ...updatedProfile,
          lastLoginAt: now,
        },
        { merge: true }
      );

      return updatedProfile;
    }
  } catch (error) {
    console.warn("Failed to sync user profile with Firestore (fallback to auth profile):", error);
    return defaultProfile;
  }
}

/**
 * Display Name(닉네임) 중복 검사
 * - Firestore 'user' 컬렉션에서 'name' 필드가 동일한 다른 사용자 문서가 존재하는지 확인
 * - currentUid가 주어지면 본인의 문서는 중복 대상에서 제외
 */
export async function checkDisplayNameDuplicate(
  displayName: string,
  currentUid?: string
): Promise<{ isDuplicate: boolean; message: string }> {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { isDuplicate: false, message: "닉네임을 입력해 주세요." };
  }
  if (trimmed.length < 2) {
    return { isDuplicate: false, message: "닉네임은 최소 2자 이상 입력해 주세요." };
  }
  if (trimmed.length > 20) {
    return { isDuplicate: false, message: "닉네임은 최대 20자까지 가능해요." };
  }

  try {
    const usersCol = collection(db, "user");
    const q = query(usersCol, where("name", "==", trimmed));
    const snap = await getDocs(q);

    // 본인(currentUid) 문서를 제외한 다른 사용자가 있는지 확인
    const duplicates = snap.docs.filter((d) => d.id !== currentUid);
    if (duplicates.length > 0) {
      return {
        isDuplicate: true,
        message: "이미 다른 회원이 사용 중인 이름이에요.",
      };
    }
    return {
      isDuplicate: false,
      message: "사용 가능한 멋진 이름이에요! ✓",
    };
  } catch (error) {
    console.warn("닉네임 중복 확인 중 Firestore 쿼리 오류:", error);
    // 권한 또는 네트워크 제한 시 fallback
    return {
      isDuplicate: false,
      message: "중복 확인 조회를 완료할 수 없으나 저장 가능해요.",
    };
  }
}

/**
 * user/{uid} 경로의 프로필 정보 수정
 */
export async function updateUserProfileInFirestore(
  uid: string,
  profileData: {
    name: string;
    bio?: string;
    jobTitle?: string;
    location?: string;
    avatarUrl?: string;
  },
  socialsData?: Partial<SocialLinks>
): Promise<UserProfile> {
  if (!uid) throw new Error("사용자 UID가 필요합니다.");

  const docRef = getUserDocRef(uid);
  const now = new Date().toISOString();

  const updatePayload: Record<string, unknown> = {
    name: profileData.name.trim(),
    updatedAt: now,
  };

  if (profileData.bio !== undefined) updatePayload.bio = profileData.bio.trim();
  if (profileData.jobTitle !== undefined) updatePayload.jobTitle = profileData.jobTitle.trim();
  if (profileData.location !== undefined) updatePayload.location = profileData.location.trim();
  if (profileData.avatarUrl !== undefined) updatePayload.avatarUrl = profileData.avatarUrl.trim();
  if (socialsData) updatePayload.socials = socialsData;

  await setDoc(docRef, updatePayload, { merge: true });

  const updatedSnap = await getDoc(docRef);
  const data = updatedSnap.data() || {};

  return {
    uid,
    name: (data.name as string) || profileData.name.trim(),
    email: data.email || "",
    bio: (data.bio as string) ?? "나만의 링크를 한곳에서 관리하고 공유해요.",
    avatarUrl: (data.avatarUrl as string) || profileData.avatarUrl || "/profile.png",
    jobTitle: (data.jobTitle as string) || profileData.jobTitle || "마이페이지 회원",
    location: (data.location as string) || profileData.location || "대한민국",
    firestorePath: `user/${uid}/links`,
    isGoogleAuth: true,
    createdAt: data.createdAt,
    updatedAt: now,
  };
}

/**
 * Firestore user/{uid}/links 컬렉션에 링크 추가
 */
export async function addLinkToFirestore(
  uid: string,
  linkData: Omit<LinkItem, "id" | "order" | "createdAt">,
  order: number = 0
): Promise<LinkItem> {
  if (!uid) throw new Error("사용자 UID가 필요합니다.");
  const colRef = getUserLinksCollectionRef(uid);
  const createdAt = new Date().toISOString();
  const updatedAt = (linkData as { updatedAt?: string }).updatedAt || createdAt;

  const payload: Record<string, unknown> = {
    title: linkData.title,
    url: linkData.url,
    category: linkData.category || "projects",
    icon: linkData.icon || "link",
    active: linkData.active !== false,
    order,
    createdAt,
    updatedAt,
  };

  if (linkData.description && linkData.description.trim()) {
    payload.description = linkData.description.trim();
  }

  const docRef = await addDoc(colRef, payload);

  return {
    id: docRef.id,
    title: payload.title as string,
    url: payload.url as string,
    description: payload.description as string | undefined,
    category: payload.category as string,
    icon: payload.icon as string,
    active: payload.active as boolean,
    order: payload.order as number,
    createdAt: payload.createdAt as string,
    updatedAt: payload.updatedAt as string,
  };
}

/**
 * Firestore user/{uid}/links 컬렉션의 모든 링크 목록 조회 (createdAt 기준 최신순 정렬)
 */
export async function getLinksFromFirestore(uid: string): Promise<LinkItem[]> {
  if (!uid) return [];
  try {
    const colRef = getUserLinksCollectionRef(uid);
    let snapshot: QuerySnapshot<DocumentData>;

    try {
      const q = query(colRef, orderBy("createdAt", "desc"));
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(colRef);
    }

    const links = snapshot.docs.map(mapDocToLinkItem);

    // 최신 등록순 정렬
    links.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return links;
  } catch (error) {
    console.warn(`Failed to get links from Firestore (user/${uid}/links):`, error);
    return [];
  }
}

/**
 * Firestore user/{uid}/links 컬렉션에서 특정 링크 삭제
 */
export async function deleteLinkFromFirestore(uid: string, id: string): Promise<void> {
  if (!uid) throw new Error("사용자 UID가 필요합니다.");
  try {
    const docRef = doc(db, "user", uid, "links", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Failed to delete link (${id}) from Firestore:`, error);
    throw error;
  }
}

/**
 * Firestore user/{uid}/links 컬렉션에서 특정 링크 수정
 */
export async function updateLinkInFirestore(
  uid: string,
  id: string,
  linkData: Partial<Omit<LinkItem, "id">>
): Promise<void> {
  if (!uid) throw new Error("사용자 UID가 필요합니다.");
  try {
    const docRef = doc(db, "user", uid, "links", id);
    const payload: Record<string, unknown> = {};

    if (linkData.title !== undefined) payload.title = linkData.title.trim();
    if (linkData.url !== undefined) payload.url = linkData.url.trim();
    if (linkData.description !== undefined) {
      payload.description = linkData.description.trim() || "";
    }
    if (linkData.category !== undefined) payload.category = linkData.category;
    if (linkData.icon !== undefined) payload.icon = linkData.icon;
    if (linkData.active !== undefined) payload.active = linkData.active;
    if (linkData.order !== undefined) payload.order = linkData.order;

    payload.updatedAt = linkData.updatedAt || new Date().toISOString();

    await updateDoc(docRef, payload);
  } catch (error) {
    console.warn(`Failed to update link (${id}) in Firestore:`, error);
    throw error;
  }
}

/**
 * Firestore user/{uid}/links 컬렉션에 샘플 링크 일괄 등록 헬퍼
 */
export async function seedSampleLinksToFirestore(
  uid: string,
  sampleLinks: LinkItem[]
): Promise<LinkItem[]> {
  if (!uid) throw new Error("사용자 UID가 필요합니다.");
  const colRef = getUserLinksCollectionRef(uid);
  const added: LinkItem[] = [];

  for (let i = 0; i < sampleLinks.length; i++) {
    const s = sampleLinks[i];
    const createdAt = new Date(Date.now() - (sampleLinks.length - i) * 1000).toISOString();
    const payload: Record<string, unknown> = {
      title: s.title,
      url: s.url,
      category: s.category || "projects",
      icon: s.icon || "link",
      active: s.active !== false,
      order: s.order ?? i,
      createdAt,
      updatedAt: createdAt,
    };
    if (s.description) payload.description = s.description;

    const docRef = await addDoc(colRef, payload);
    added.push({
      id: docRef.id,
      title: payload.title as string,
      url: payload.url as string,
      description: payload.description as string | undefined,
      category: payload.category as string,
      icon: payload.icon as string,
      active: payload.active as boolean,
      order: payload.order as number,
      createdAt: payload.createdAt as string,
      updatedAt: payload.updatedAt as string,
    });
  }

  added.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  return added;
}
