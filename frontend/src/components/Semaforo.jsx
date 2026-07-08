import React from 'react';

export default function Semaforo({ estadoSemaforo }) {
    // Función para determinar el color exacto basado en la palabra
    const obtenerColor = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'VERDE': return '#28a745';   // Verde éxito
            case 'AMARILLO': return '#ffc107'; // Amarillo alerta
            case 'ROJO': return '#dc3545';     // Rojo peligro
            default: return '#6c757d';         // Gris por defecto (si no hay estado)
        }
    };

    const color = obtenerColor(estadoSemaforo);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
                style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    boxShadow: `0 0 5px ${color}`, // Le da un pequeño efecto de brillo
                    border: '1px solid rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'help'
                }}
                title={`Estado Operativo: ${estadoSemaforo}`} // Esto muestra un texto al pasar el mouse
            />
            <span style={{ fontSize: '0.9em', fontWeight: 'bold', color: color }}>
                {estadoSemaforo}
            </span>
        </div>
    );
}