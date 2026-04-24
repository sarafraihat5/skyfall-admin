import PropTypes from "prop-types";
import "./compoStyle/ConfirmDialog.css";

export default function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-title">Are you sure?</div>
        <div className="confirm-msg">{msg}</div>

        <div className="confirm-btns">
          <button
            className="btn-confirm-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="btn-confirm-del"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/*  PropTypes */

ConfirmDialog.propTypes = {
  msg: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};