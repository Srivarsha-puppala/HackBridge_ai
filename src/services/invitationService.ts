import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { toast } from 'sonner';

/**
 * INVITATION SERVICE
 * Manages the lifecycle of squad join requests within HackBridge.
 */

// 1. Send a Join Request
// This function now uses 'receiverId' to match your Security Rules
export const sendInvitation = async (
  teamId: string, 
  teamName: string, 
  teamLeadId: string, 
  senderId: string, 
  senderName: string
) => {
  try {
    const invitationsRef = collection(db, "invitations");
    
    await addDoc(invitationsRef, {
      teamId,
      teamName,
      receiverId: teamLeadId, // MUST be 'receiverId' for ManageTeam.tsx to see it
      senderId,
      senderName,
      status: "pending",
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending invitation:", error);
    throw error;
  }
};

// 2. Real-time Listener for ManageTeam.tsx
// Filters by 'receiverId' so leads only see their own requests
export const subscribeToIncomingRequests = (userId: string, callback: (requests: any[]) => void) => {
  const q = query(
    collection(db, "invitations"),
    where("receiverId", "==", userId), // Matches the security rule check
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(requests);
  }, (error) => {
    // This error triggers if the field name doesn't match 'receiverId'
    console.error("Firestore subscription error:", error);
  });
};

// 3. Update Request Status (Approve/Reject)
export const updateRequestStatus = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
  try {
    const requestRef = doc(db, "invitations", requestId);
    await updateDoc(requestRef, {
      status: newStatus
    });
    toast.success(`Request ${newStatus} successfully!`);
  } catch (error) {
    toast.error("Failed to update request status.");
    console.error(error);
  }
};