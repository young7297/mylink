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
  increment,
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
 * Firestore 개인화 경로 헬퍼: users/{uid}/links
 */
export const getUserLinksPath = (uid: string) => `users/${uid}/links`;

export const getUserLinksCollectionRef = (uid: string) => {
  return collection(db, "users", uid, "links");
};

export const getUserDocRef = (uid: string) => {
  return doc(db, "users", uid);
};

export const getLegacyUserDocRef = (uid: string) => {
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
    clickCount: typeof data.clickCount === "number" ? data.clickCount : (typeof data.clicks === "number" ? data.clicks : 0),
    createdAt: createdAtStr,
    updatedAt: updatedAtStr,
  };
}

/**
 * users/{uid} 또는 user/{uid} 경로에서 유저 프로필 조회
 */
export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  try {
    let snap = await getDoc(getUserDocRef(uid));
    if (!snap.exists()) {
      snap = await getDoc(getLegacyUserDocRef(uid));
    }
    if (!snap.exists()) return null;

    const data = snap.data();
    const email = data.email || "";
    // 사용자가 직접 설정한 이름이 있으면 최우선 적용, 없을 때만 이메일 접두사/기본값 사용
    const resolvedName = ((data.displayName as string) || (data.name as string))?.trim() || getEmailPrefix(email, "사용자");

    return {
      uid,
      name: resolvedName,
      displayName: resolvedName,
      email,
      bio: data.bio ?? "나만의 링크를 한곳에서 관리하고 공유해요.",
      avatarUrl: data.avatarUrl || "/profile.png",
      jobTitle: data.jobTitle || "마이페이지 회원",
      location: data.location || "대한민국",
      firestorePath: `users/${uid}/links`,
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
 * Google 로그인 성공 시 users/{uid} 및 user/{uid} 경로에 유저 프로필 동기화 및 저장
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
    displayName: fallbackName,
    email,
    avatarUrl: authUser.photoURL || "/profile.png",
    bio: "나만의 맞춤 링크를 한곳에서 관리하고 공유해요.",
    jobTitle: "마이페이지 회원",
    location: "대한민국",
    firestorePath: `users/${uid}/links`,
    isGoogleAuth: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const usersDocRef = getUserDocRef(uid);
    const legacyDocRef = getLegacyUserDocRef(uid);

    let snap = await getDoc(usersDocRef);
    if (!snap.exists()) {
      snap = await getDoc(legacyDocRef);
    }

    if (!snap.exists()) {
      // 최초 생성: Firestore users/{uid} 및 user/{uid} 경로에 저장
      const savePayload = {
        ...defaultProfile,
        userId: uid,
        lastLoginAt: now,
      };
      await setDoc(usersDocRef, savePayload);
      try {
        await setDoc(legacyDocRef, savePayload);
      } catch (e) {
        console.warn("Legacy user profile sync failed:", e);
      }
      return defaultProfile;
    } else {
      // 기존 문서가 존재하면 사용자가 설정해둔 기존 이름(name/displayName)을 유지
      const existing = snap.data();
      const preservedName = ((existing.displayName as string) || (existing.name as string))?.trim() || fallbackName;

      const updatedProfile: UserProfile = {
        uid,
        name: preservedName,
        displayName: preservedName,
        email,
        avatarUrl: existing.avatarUrl || authUser.photoURL || "/profile.png",
        bio: existing.bio ?? "나만의 맞춤 링크를 한곳에서 관리하고 공유해요.",
        jobTitle: existing.jobTitle || "마이페이지 회원",
        location: existing.location || "대한민국",
        firestorePath: `users/${uid}/links`,
        isGoogleAuth: true,
        createdAt: existing.createdAt || now,
        updatedAt: now,
      };

      const savePayload = {
        ...updatedProfile,
        userId: uid,
        lastLoginAt: now,
      };

      await setDoc(usersDocRef, savePayload, { merge: true });
      try {
        await setDoc(legacyDocRef, savePayload, { merge: true });
      } catch (e) {
        console.warn("Legacy user profile update failed:", e);
      }

      return updatedProfile;
    }
  } catch (error) {
    console.warn("Failed to sync user profile with Firestore (fallback to auth profile):", error);
    return defaultProfile;
  }
}

/**
 * Display Name(닉네임) 중복 검사
 * - Firestore 'users' 및 'user' 컬렉션에서 'displayName' 및 'name' 필드가 동일한 다른 사용자 문서가 존재하는지 확인
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
    const usersCol = collection(db, "users");
    const q1 = query(usersCol, where("displayName", "==", trimmed));
    const snap1 = await getDocs(q1);
    const duplicates1 = snap1.docs.filter((d) => d.id !== currentUid);
    if (duplicates1.length > 0) {
      return { isDuplicate: true, message: "이미 다른 회원이 사용 중인 이름이에요." };
    }

    const q2 = query(usersCol, where("name", "==", trimmed));
    const snap2 = await getDocs(q2);
    const duplicates2 = snap2.docs.filter((d) => d.id !== currentUid);
    if (duplicates2.length > 0) {
      return { isDuplicate: true, message: "이미 다른 회원이 사용 중인 이름이에요." };
    }

    // legacy 'user' 컬렉션 확인
    const legacyCol = collection(db, "user");
    const q3 = query(legacyCol, where("displayName", "==", trimmed));
    const snap3 = await getDocs(q3);
    const duplicates3 = snap3.docs.filter((d) => d.id !== currentUid);
    if (duplicates3.length > 0) {
      return { isDuplicate: true, message: "이미 다른 회원이 사용 중인 이름이에요." };
    }

    const q4 = query(legacyCol, where("name", "==", trimmed));
    const snap4 = await getDocs(q4);
    const duplicates4 = snap4.docs.filter((d) => d.id !== currentUid);
    if (duplicates4.length > 0) {
      return { isDuplicate: true, message: "이미 다른 회원이 사용 중인 이름이에요." };
    }

    return {
      isDuplicate: false,
      message: "사용 가능한 멋진 이름이에요! ✓",
    };
  } catch (error) {
    console.warn("닉네임 중복 확인 중 Firestore 쿼리 오류:", error);
    return {
      isDuplicate: false,
      message: "중복 확인 조회를 완료할 수 없으나 저장 가능해요.",
    };
  }
}

export interface UserLookupResult {
  userId: string;
  profile: UserProfile;
  socials?: SocialLinks;
}

/**
 * displayName으로 userId 및 프로필 검색 (Firestore where 쿼리)
 * - users 컬렉션에서 where("displayName", "==", displayName) 쿼리
 * - name 필드 및 legacy user 컬렉션 fallback 지원
 * - 일치하는 사용자가 없을 경우 null 반환 (404 대응)
 */
export async function getUserByDisplayName(
  displayName: string
): Promise<UserLookupResult | null> {
  const trimmed = decodeURIComponent(displayName).trim();
  if (!trimmed) return null;

  try {
    // 1. Where 쿼리: users 컬렉션에서 displayName 일치 검색
    const usersCol = collection(db, "users");
    let q = query(usersCol, where("displayName", "==", trimmed));
    let snap = await getDocs(q);

    // 2. 보조 쿼리: users 컬렉션에서 name 일치 검색
    if (snap.empty) {
      q = query(usersCol, where("name", "==", trimmed));
      snap = await getDocs(q);
    }

    // 3. Fallback: 기존 user 컬렉션(단수)에서 displayName 또는 name 검색
    if (snap.empty) {
      const userCol = collection(db, "user");
      q = query(userCol, where("displayName", "==", trimmed));
      snap = await getDocs(q);
      if (snap.empty) {
        q = query(userCol, where("name", "==", trimmed));
        snap = await getDocs(q);
      }
    }

    // 4. Fallback: UID 직접 매칭 (만약 displayName 대신 uid로 직접 접근했을 경우)
    if (snap.empty) {
      const directUsersDoc = await getDoc(doc(db, "users", trimmed));
      if (directUsersDoc.exists()) {
        const d = directUsersDoc.data();
        const nameVal = (d.displayName as string) || (d.name as string) || trimmed;
        return {
          userId: directUsersDoc.id,
          profile: {
            uid: directUsersDoc.id,
            name: nameVal,
            displayName: nameVal,
            email: d.email || "",
            bio: d.bio ?? "나만의 맞춤 링크를 한곳에서 관리하고 공유해요.",
            avatarUrl: d.avatarUrl || "/profile.png",
            jobTitle: d.jobTitle || "마이페이지 회원",
            location: d.location || "대한민국",
            firestorePath: `users/${directUsersDoc.id}/links`,
            isGoogleAuth: d.isGoogleAuth !== false,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          },
          socials: d.socials,
        };
      }
    }

    if (snap.empty) {
      return null;
    }

    const docSnap = snap.docs[0];
    const data = docSnap.data();
    const userId = docSnap.id;
    const nameVal = (data.displayName as string) || (data.name as string) || trimmed;

    return {
      userId,
      profile: {
        uid: userId,
        name: nameVal,
        displayName: nameVal,
        email: data.email || "",
        bio: data.bio ?? "나만의 맞춤 링크를 한곳에서 관리하고 공유해요.",
        avatarUrl: data.avatarUrl || "/profile.png",
        jobTitle: data.jobTitle || "마이페이지 회원",
        location: data.location || "대한민국",
        firestorePath: `users/${userId}/links`,
        isGoogleAuth: data.isGoogleAuth !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      socials: data.socials,
    };
  } catch (error) {
    console.error("getUserByDisplayName 조회 실패:", error);
    return null;
  }
}

/**
 * users/{uid} 및 user/{uid} 경로의 프로필 정보 수정
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

  const trimmedName = profileData.name.trim();
  const docRef = getUserDocRef(uid);
  const legacyDocRef = getLegacyUserDocRef(uid);
  const now = new Date().toISOString();

  const updatePayload: Record<string, unknown> = {
    name: trimmedName,
    displayName: trimmedName,
    userId: uid,
    updatedAt: now,
  };

  if (profileData.bio !== undefined) updatePayload.bio = profileData.bio.trim();
  if (profileData.jobTitle !== undefined) updatePayload.jobTitle = profileData.jobTitle.trim();
  if (profileData.location !== undefined) updatePayload.location = profileData.location.trim();
  if (profileData.avatarUrl !== undefined) updatePayload.avatarUrl = profileData.avatarUrl.trim();
  if (socialsData) updatePayload.socials = socialsData;

  await setDoc(docRef, updatePayload, { merge: true });
  try {
    await setDoc(legacyDocRef, updatePayload, { merge: true });
  } catch (e) {
    console.warn("Legacy user profile update failed:", e);
  }

  const updatedSnap = await getDoc(docRef);
  const data = updatedSnap.data() || {};
  const resolvedName = (data.displayName as string) || (data.name as string) || trimmedName;

  return {
    uid,
    name: resolvedName,
    displayName: resolvedName,
    email: data.email || "",
    bio: (data.bio as string) ?? "나만의 링크를 한곳에서 관리하고 공유해요.",
    avatarUrl: (data.avatarUrl as string) || profileData.avatarUrl || "/profile.png",
    jobTitle: (data.jobTitle as string) || profileData.jobTitle || "마이페이지 회원",
    location: (data.location as string) || profileData.location || "대한민국",
    firestorePath: `users/${uid}/links`,
    isGoogleAuth: true,
    createdAt: data.createdAt,
    updatedAt: now,
  };
}

/**
 * Firestore users/{uid}/links 컬렉션에 링크 추가 (user/{uid}/links 동기화)
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
    clickCount: (linkData as { clickCount?: number }).clickCount ?? 0,
    createdAt,
    updatedAt,
  };

  if (linkData.description && linkData.description.trim()) {
    payload.description = linkData.description.trim();
  }

  const docRef = await addDoc(colRef, payload);

  // legacy 경로 user/{uid}/links 에도 복제
  try {
    await setDoc(doc(db, "user", uid, "links", docRef.id), payload);
  } catch (e) {
    console.warn("Mirroring to legacy user links failed:", e);
  }

  return {
    id: docRef.id,
    title: payload.title as string,
    url: payload.url as string,
    description: payload.description as string | undefined,
    category: payload.category as string,
    icon: payload.icon as string,
    active: payload.active as boolean,
    order: payload.order as number,
    clickCount: payload.clickCount as number,
    createdAt: payload.createdAt as string,
    updatedAt: payload.updatedAt as string,
  };
}

/**
 * Firestore users/{uid}/links 컬렉션의 모든 링크 목록 조회 (createdAt 기준 최신순 정렬)
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

    // 만약 users/{uid}/links 가 비어있다면 legacy user/{uid}/links 확인
    if (snapshot.empty) {
      const legacyCol = collection(db, "user", uid, "links");
      try {
        const qLegacy = query(legacyCol, orderBy("createdAt", "desc"));
        const legacySnap = await getDocs(qLegacy);
        if (!legacySnap.empty) {
          snapshot = legacySnap;
        }
      } catch {
        // ignore
      }
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
    console.warn(`Failed to get links from Firestore (users/${uid}/links):`, error);
    return [];
  }
}

/**
 * Firestore users/{uid}/links 및 user/{uid}/links 컬렉션에서 특정 링크 삭제
 */
export async function deleteLinkFromFirestore(uid: string, id: string): Promise<void> {
  if (!uid) throw new Error("사용자 UID가 필요합니다.");
  try {
    const docRef = doc(db, "users", uid, "links", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Failed to delete link (${id}) from users collection:`, error);
  }

  try {
    const legacyDocRef = doc(db, "user", uid, "links", id);
    await deleteDoc(legacyDocRef);
  } catch (error) {
    console.warn(`Failed to delete link (${id}) from legacy user collection:`, error);
  }
}

/**
 * Firestore users/{uid}/links 및 user/{uid}/links 컬렉션에서 특정 링크 수정
 */
export async function updateLinkInFirestore(
  uid: string,
  id: string,
  linkData: Partial<Omit<LinkItem, "id">>
): Promise<void> {
  if (!uid) throw new Error("사용자 UID가 필요합니다.");
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
  if (linkData.clickCount !== undefined) payload.clickCount = linkData.clickCount;

  payload.updatedAt = linkData.updatedAt || new Date().toISOString();

  try {
    const docRef = doc(db, "users", uid, "links", id);
    await updateDoc(docRef, payload);
  } catch (error) {
    console.warn(`Failed to update link (${id}) in users collection:`, error);
  }

  try {
    const legacyDocRef = doc(db, "user", uid, "links", id);
    await updateDoc(legacyDocRef, payload);
  } catch (error) {
    console.warn(`Failed to update link (${id}) in legacy user collection:`, error);
  }
}

/**
 * Firestore users/{uid}/links 컬렉션에 샘플 링크 일괄 등록 헬퍼
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
      clickCount: s.clickCount ?? 0,
      createdAt,
      updatedAt: createdAt,
    };
    if (s.description) payload.description = s.description;

    const docRef = await addDoc(colRef, payload);
    try {
      await setDoc(doc(db, "user", uid, "links", docRef.id), payload);
    } catch {
      // ignore
    }

    added.push({
      id: docRef.id,
      title: payload.title as string,
      url: payload.url as string,
      description: payload.description as string | undefined,
      category: payload.category as string,
      icon: payload.icon as string,
      active: payload.active as boolean,
      order: payload.order as number,
      clickCount: payload.clickCount as number,
      createdAt: payload.createdAt as string,
      updatedAt: payload.updatedAt as string,
    });
  }

  added.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  return added;
}

/**
 * 링크 클릭 시 Firestore의 clickCount를 1 증가 (Atomic Increment)
 * - users/{uid}/links/{id} 및 legacy user/{uid}/links/{id} 경로에 반영
 */
export async function recordLinkClick(uid: string, id: string): Promise<void> {
  if (!uid || !id) return;
  try {
    const docRef = doc(db, "users", uid, "links", id);
    await updateDoc(docRef, {
      clickCount: increment(1),
    });
  } catch (error) {
    console.warn(`users 컬렉션 링크(${id}) 클릭 카운트 저장 실패:`, error);
  }

  try {
    const legacyDocRef = doc(db, "user", uid, "links", id);
    await updateDoc(legacyDocRef, {
      clickCount: increment(1),
    });
  } catch (error) {
    console.warn(`legacy user 컬렉션 링크(${id}) 클릭 카운트 저장 실패:`, error);
  }
}
