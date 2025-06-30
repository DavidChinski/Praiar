import React, { useRef } from "react";

function ElementoAutocomplete({
  elementoInput,
  setElementoInput,
  elementoMatches,
  setElementoMatches,
  agregarElementoTipo,
  elementoInputRef,
  elementoDropdownRef
}) {
  const showSuggestions = elementoInput.length > 0 && elementoMatches.length > 0;
  return (
    <div className="input-autocomplete-wrapper" ref={elementoDropdownRef}>
      <input
        ref={elementoInputRef}
        className="input-estandar"
        type="text"
        placeholder="Agregar elemento (pasillo, pileta, quincho...)"
        value={elementoInput}
        onChange={e => setElementoInput(e.target.value)}
        autoComplete="off"
      />
      {showSuggestions && (
        <div className="autocomplete-dropdown">
          {elementoMatches.map((elemento, idx) => (
            <div
              key={elemento.tipo}
              className="autocomplete-option"
              onMouseDown={e => {
                e.preventDefault();
                setElementoInput(elemento.nombre);
                agregarElementoTipo(elemento.tipo);
                setElementoMatches([]);
                setTimeout(() => elementoInputRef.current && elementoInputRef.current.blur(), 0);
              }}
            >
              <span className="suggestion-text">
                <span className="typed-text">{elemento.nombre.slice(0, elementoInput.length)}</span>
                <span className="completion-text">{elemento.nombre.slice(elementoInput.length)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ElementoAutocomplete;