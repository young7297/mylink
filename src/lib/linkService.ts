import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { LinkItem } from "@/types/link";

/**
 * Firestore 컬렉션 경로: users/anonymous/links
 */
export const FIRESTORE_LINKS_PATH = "users/anonymous/links";

export const getLinksCollectionRef = () => {
  return collection(db, "users", "anonymous", "links");
};

/**
 * Firestore 문서 데이터를 LinkItem 인터페이스로 변환
 */
function mapDocToLinkItem(docSnap: any): LinkItem {
  const data = docSnap.data();
  let createdAtStr = new Date().toISOString();
  if (typeof data.createdAt === "string") {
    createdAtStr = data.createdAt;
  } else if (data.createdAt?.toDate && typeof data.createdAt.toDate === "function") {
    createdAtStr = data.createdAt.toDate().toISOString();
  } else if (data.createdAt?.seconds) {
    createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
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
  };
}

/**
 * Firestore users/anonymous/links 컬렉션에 링크 추가
 */
export async function addLinkToFirestore(
  linkData: Omit<LinkItem, "id" | "order" | "createdAt">,
  order: number = 0
): Promise<LinkItem> {
  const colRef = getLinksCollectionRef();
  const createdAt = new Date().toISOString();

  // undefined 필드는 Firestore 저장 시 에러를 유발하므로 정제
  const payload: Record<string, any> = {
    title: linkData.title,
    url: linkData.url,
    category: linkData.category || "projects",
    icon: linkData.icon || "link",
    active: linkData.active !== false,
    order,
    createdAt,
  };

  if (linkData.description && linkData.description.trim()) {
    payload.description = linkData.description.trim();
  }

  const docRef = await addDoc(colRef, payload);

  return {
    id: docRef.id,
    title: payload.title,
    url: payload.url,
    description: payload.description,
    category: payload.category,
    icon: payload.icon,
    active: payload.active,
    order: payload.order,
    createdAt: payload.createdAt,
  };
}

/**
 * Firestore users/anonymous/links 컬렉션의 모든 링크 목록 조회 (createdAt 기준 최신순 정렬)
 */
export async function getLinksFromFirestore(): Promise<LinkItem[]> {
  try {
    const colRef = getLinksCollectionRef();
    let snapshot: QuerySnapshot<DocumentData>;

    try {
      const q = query(colRef, orderBy("createdAt", "desc"));
      snapshot = await getDocs(q);
    } catch {
      // 인덱스 또는 필드 누락 등의 예외 상황 대비 fallback
      snapshot = await getDocs(colRef);
    }

    const links = snapshot.docs.map(mapDocToLinkItem);

    // createdAt 기준 최신순 정렬 보장
    links.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return links;
  } catch (error) {
    console.warn("Failed to get links from Firestore:", error);
    return [];
  }
}

/**
 * Firestore users/anonymous/links 컬렉션에서 특정 링크 삭제
 */
export async function deleteLinkFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, "users", "anonymous", "links", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Failed to delete link (${id}) from Firestore:`, error);
    throw error;
  }
}

/**
 * Firestore users/anonymous/links 컬렉션에 샘플 링크 일괄 등록 헬퍼
 */
export async function seedSampleLinksToFirestore(sampleLinks: LinkItem[]): Promise<LinkItem[]> {
  const colRef = getLinksCollectionRef();
  const added: LinkItem[] = [];

  for (let i = 0; i < sampleLinks.length; i++) {
    const s = sampleLinks[i];
    const createdAt = new Date(Date.now() - (sampleLinks.length - i) * 1000).toISOString();
    const payload: Record<string, any> = {
      title: s.title,
      url: s.url,
      category: s.category || "projects",
      icon: s.icon || "link",
      active: s.active !== false,
      order: s.order ?? i,
      createdAt,
    };
    if (s.description) payload.description = s.description;

    const docRef = await addDoc(colRef, payload);
    added.push({
      id: docRef.id,
      title: payload.title,
      url: payload.url,
      description: payload.description,
      category: payload.category,
      icon: payload.icon,
      active: payload.active,
      order: payload.order,
      createdAt: payload.createdAt,
    });
  }

  added.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  return added;
}
