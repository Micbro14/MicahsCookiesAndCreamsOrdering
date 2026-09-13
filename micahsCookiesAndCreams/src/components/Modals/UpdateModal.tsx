import { useEffect, useState } from "react";
import { ModalShell } from "./ModalShell";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateModal({ isOpen, onClose }: UpdateModalProps) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (isOpen && !seen) {
      localStorage.setItem("lastSeenUpdate", new Date().toISOString());
      setSeen(true);
    }
  }, [isOpen, seen]);

  return (
    <ModalShell isOpen={isOpen} title="What&apos;s New!" onClose={onClose}>
      <p>Micah&apos;s Cookies &amp; Creams has a new React-based ordering flow.</p>
      <p>Updates include the new flavor gallery, cart state persistence, and modular product customization workflow.</p>
      <div className="modal-actions">
        <button type="button" className="primary-button small" onClick={onClose}>
          Continue
        </button>
      </div>
    </ModalShell>
  );
}

export default UpdateModal;
