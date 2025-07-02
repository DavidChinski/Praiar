import React from 'react';
import './FasesReserva.css';

function FasesReserva({ faseActual = 2 }) {
    const fases = [
    { numero: 1, texto: 'Tu selección', completada: true },
    { numero: 2, texto: 'Tus datos', completada: false, activa: faseActual === 2 },
    { numero: 3, texto: 'Terminar reserva', completada: false, activa: faseActual === 3 }
    ];

    return (
    <div className="fases-reserva">
        {fases.map((fase, index) => (
        <React.Fragment key={fase.numero}>
            <div className='fase'>
                <div className={`fase-circulo ${fase.completada ? 'completada' : ''} ${fase.activa ? 'activa' : ''}`}>
                {fase.completada ? (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                ) : (
                    <span className="fase-numero">{fase.numero}</span>
                )}
                </div>
                <span className={`fase-texto ${fase.completada ? 'completada' : ''} ${fase.activa ? 'activa' : ''}`}>
                {fase.texto}
                </span>
            </div>
            {index < fases.length - 1 && (
            <div className='fase-linea activa'></div>
            )}
        </React.Fragment>
        ))}
    </div>
    );
}

export default FasesReserva;
