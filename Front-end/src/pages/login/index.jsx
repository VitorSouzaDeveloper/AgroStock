import { useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import Logo from '../../components/Logo';
import './style.css';

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const inputEmail = useRef();
    const inputSenha = useRef();

    async function handleLogin() {
        try {
            const email = inputEmail.current.value;
            const senha = inputSenha.current.value;

            if (!email || !senha) {
                alert("Por favor, preencha e-mail e senha.");
                return;
            }

            const response = await api.post('/login', { email, senha });
            
            // Passa o objeto inteiro { user, token } para a função de login
            login(response.data); 
            
            navigate('/dashboard');

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Falha no login. Tente novamente.';
            alert(errorMessage);
        }
    }

    return (
        <div className='container'>
            <Logo />
            <form>
                <h2>Acesse sua conta</h2>
                <input name='email' type='email' placeholder='E-mail' required ref={inputEmail} />
                <input name='senha' type='password' placeholder='Senha' required ref={inputSenha} />
                <button type='button' onClick={handleLogin}>Entrar</button>
                <div className='footer'>
                    <p>Não possui uma conta?
                        <Link to="/signup"> Cadastre-se</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Login;