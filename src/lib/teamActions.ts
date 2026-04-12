import { doc, writeBatch, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function getCombinedId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

export async function sendTeamRequest(fromUid: string, fromName: string, toUid: string, toName: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "profiles", fromUid), {
    sentInvitations: arrayUnion({ uid: toUid, name: toName }),
  });
  batch.update(doc(db, "profiles", toUid), {
    incomingRequests: arrayUnion({ uid: fromUid, name: fromName }),
  });
  await batch.commit();
}

export async function handleAccept(myUid: string, myName: string, partnerUid: string, partnerName: string) {
  const combinedId = getCombinedId(myUid, partnerUid);
  const batch = writeBatch(db);

  // Add to both squads
  batch.update(doc(db, "profiles", myUid), {
    mySquad: arrayUnion({ uid: partnerUid, name: partnerName, combinedId }),
    incomingRequests: arrayRemove({ uid: partnerUid, name: partnerName }),
  });
  batch.update(doc(db, "profiles", partnerUid), {
    mySquad: arrayUnion({ uid: myUid, name: myName, combinedId }),
    sentInvitations: arrayRemove({ uid: myUid, name: myName }),
  });

  await batch.commit();
}

export async function handleDecline(myUid: string, partnerUid: string, partnerName: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "profiles", myUid), {
    incomingRequests: arrayRemove({ uid: partnerUid, name: partnerName }),
  });
  batch.update(doc(db, "profiles", partnerUid), {
    sentInvitations: arrayRemove({ uid: myUid, name: partnerName }),
  });
  await batch.commit();
}
