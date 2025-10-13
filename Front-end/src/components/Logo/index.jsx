import './style.css';

function Logo() {
    return (
        <div className="logo-container">
            <svg className="logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Silo */}
                <rect x="30" y="40" width="40" height="50" rx="5" fill="#2D3748" stroke="#4A5568" strokeWidth="2"/>
                <path d="M30 40 Q 50 25, 70 40 Z" fill="#2D3748" stroke="#4A5568" strokeWidth="2" />
                
                {/* Folha */}
                <path 
                    d="M 50 10 C 30 30, 30 70, 50 90 C 70 70, 70 30, 50 10 Z" 
                    fill="#48BB78" 
                    transform="rotate(30 50 50)"
                />
                <line x1="50" y1="30" x2="50" y2="90" stroke="white" strokeWidth="2"  transform="rotate(30 50 50)" />
            </svg>
            <h1 className="logo-title">AgroStock</h1>
        </div>
    );
}

export default Logo;