export default function Cargando({ pantalla, texto = 'Cargando...' }) {
  return (
    <div className={pantalla ? 'cargando-pantalla' : 'cargando'}>
      <span className="spinner oscuro" /> <span>{texto}</span>
    </div>
  );
}
