import { ModalShell } from "./ModalShell";
import type { FlavorSpec } from "../../types";

interface FlavorModalProps {
  isOpen: boolean;
  flavor?: FlavorSpec;
  onClose: () => void;
}

export function FlavorModal({ isOpen, flavor, onClose }: FlavorModalProps) {
  if (!flavor) return null;

  return (
    <ModalShell isOpen={isOpen} title={flavor.name} onClose={onClose}>
      <img src={flavor.imageUrl ?? `./images/${flavor.id}.png`} alt={flavor.name} className="modal-image" />
      <p>{flavor.description ?? "A handcrafted favorite."}</p>
      <div className="modal-actions">
        <button type="button" className="primary-button small" onClick={onClose}>
          Close
        </button>
      </div>
    </ModalShell>
  );
}

export default FlavorModal;
