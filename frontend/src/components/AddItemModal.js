import React, {useState, useEffect} from "react";
import "../style.css";

function AddItemModal({show, handleClose, handleSave, fields}) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!show) {
            setFormData({}); //si resettano i campi quando il modal si chiude
        }
    }, [show]);

    const handleChange = (e) => {
        const {name, value, type} = e.target;
        setFormData({
            ...formData,
            [name]: type === "number" ? parseInt(value, 10) || "" : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSave(formData);
        setFormData({});
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2>Aggiungi Nuovo Elemento</h2>
                <form onSubmit={handleSubmit}>
                    {fields.map((field) => (
                        <div key={field.name} className="form-group">
                            <label>{field.label}</label>
                            {field.type === "select" ? (
                                <select
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleziona</option>
                                    {field.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type || "text"}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    required
                                />
                            )}
                        </div>
                    ))}
                    <div className="modal-buttons">
                        <button type="button" className="cancel-btn" onClick={handleClose}>
                            Annulla
                        </button>
                        <button type="submit" className="save-btn">
                            Salva
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddItemModal;





