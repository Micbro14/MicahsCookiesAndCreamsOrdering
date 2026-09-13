import { ModalShell } from "./ModalShell";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeModal({ isOpen, onClose }: RecipeModalProps) {
  return (
    <ModalShell isOpen={isOpen} title="Log Recipe" onClose={onClose}>
      <label>
        Recipe Name
        <input type="text" placeholder="Weekend special" />
      </label>

      <label>
        Notes
        <textarea rows={5} placeholder="Ingredient notes and scaling details" />
      </label>

      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="primary-button small">
          Save Recipe
        </button>
      </div>
    </ModalShell>
  );
}

export default RecipeModal;
