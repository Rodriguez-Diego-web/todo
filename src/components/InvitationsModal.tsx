import { useState } from 'react';
import { useInvitations } from '../hooks/useInvitations';

interface InvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvitationsModal({ isOpen, onClose }: InvitationsModalProps) {
  const { invitations, loading, acceptInvitation, rejectInvitation } = useInvitations();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAccept = async (invitationId: string, listId: string) => {
    setProcessingId(invitationId);
    try {
      await acceptInvitation(invitationId, listId);
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setProcessingId(invitationId);
    try {
      await rejectInvitation(invitationId);
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2d2d2d] rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#404040]">
          <h2 className="text-xl font-semibold text-white">
            Einladungen ({invitations.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#404040] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Lade Einladungen...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">Keine Einladungen</h3>
              <p className="text-gray-400">
                Du hast aktuell keine ausstehenden Einladungen.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="bg-[#404040] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">
                        Einladung zu einer Liste
                      </h3>
                      <p className="text-sm text-gray-300 mb-2">
                        Du wurdest eingeladen, eine Liste zu teilen.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Von einem Benutzer</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(invitation.id, invitation.listId)}
                      disabled={processingId === invitation.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === invitation.id ? 'Lädt...' : 'Annehmen'}
                    </button>
                    <button
                      onClick={() => handleReject(invitation.id)}
                      disabled={processingId === invitation.id}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === invitation.id ? 'Lädt...' : 'Ablehnen'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 