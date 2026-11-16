import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
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
  return {
    id: docSnap.id,
    title: data.title || "",
    url: data.url || "",
    description: data.description || undefined,
    category: data.category || "projects",
    icon: data.icon || "link",
    active: data.active !== false,
    order: typeof data.order === "number" ? data.order : 0,
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
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
 * Firestore users/anonymous/links 컬렉션의 모든 링크 목록 조회
 */
export async function getLinksFromFirestore(): Promise<LinkItem[]> {
  try {
    const colRef = getLinksCollectionRef();
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(mapDocToLinkItem);
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
 * Firestore users/anonymous/links 실시간 구독 (onSnapshot)
 */
export function subscribeLinksFromFirestore(
  onUpdate: (links: LinkItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const colRef = getLinksCollectionRef();
    const q = query(colRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const links = snapshot.docs.map(mapDocToLinkItem);
        onUpdate(links);
      },
      (error) => {
        console.warn("Firestore snapshot error:", error);
        if (onError) onError(error);
      }
    );
  } catch (error: any) {
    console.warn("Failed to subscribe to Firestore links:", error);
    return () => {};
  }
}
