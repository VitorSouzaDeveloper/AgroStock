import { useRef, useContext, useState, useEffect } from 'react';
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

    const recoveryEmailRef = useRef();
    const recoveryCodeRef = useRef();
    const recoveryNewPasswordRef = useRef();

    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    
    const [recoveryStep, setRecoveryStep] = useState(0); 
    const [savedRecoveryEmail, setSavedRecoveryEmail] = useState("");

    useEffect(() => {
        const savedEmail = localStorage.getItem('agrostock_saved_email');
        if (savedEmail && inputEmail.current) {
            inputEmail.current.value = savedEmail;
            setRememberMe(true);
        }
    }, [recoveryStep]); 

    // NOVO: Adicionado o "event" para impedir que a página recarregue
    async function handleLogin(event) {
        event.preventDefault(); // Bloqueia o "refresh" automático do formulário

        try {
            setIsLoading(true);
            const email = inputEmail.current.value;
            const senha = inputSenha.current.value;

            if (!email || !senha) {
                alert("Por favor, preencha e-mail e senha.");
                setIsLoading(false);
                return;
            }

            const response = await api.post('/login', { email, senha });
            
            if (rememberMe) {
                localStorage.setItem('agrostock_saved_email', email);
            } else {
                localStorage.removeItem('agrostock_saved_email');
            }
            
            // NOVO E CRUCIAL: Injeta o token na API para a próxima página não o expulsar!
            api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
            
            login(response.data); 
            
            // ATENÇÃO: Verifique se o nome da sua rota principal é mesmo '/dashboard'. 
            // Se a sua página principal for a de estoque ou a home, mude para '/stock' ou '/home'.
            navigate('/dashboard'); 

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Falha no login. Tente novamente.';
            alert("ERRO: " + errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    // ... (As funções handleRequestCode e handleResetPassword continuam exatamente iguais) ...
    async function handleRequestCode() {
        const email = recoveryEmailRef.current.value;
        if (!email) return alert("Digite o seu e-mail para receber o código.");

        try {
            setIsLoading(true);
            await api.post('/forgot-password', { email });
            setSavedRecoveryEmail(email); 
            alert("Código enviado! Verifique a sua caixa de entrada (e o Spam).");
            setRecoveryStep(2); 
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao enviar e-mail.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResetPassword() {
        const email = savedRecoveryEmail; 
        const code = recoveryCodeRef.current.value;
        const newPassword = recoveryNewPasswordRef.current.value;

        if (!code || !newPassword) return alert("Preencha o código e a nova senha.");
        if (newPassword.length < 6) return alert("A nova senha deve ter no mínimo 6 caracteres.");

        try {
            setIsLoading(true);
            await api.post('/reset-password', { email, code, newPassword });
            alert("Senha alterada com sucesso! Já pode fazer login.");
            setRecoveryStep(0); 
            setSavedRecoveryEmail(""); 
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao redefinir a senha. Código inválido?';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    if (recoveryStep === 1) {
        // ... (Mesmo código do ecrã 1)
        return (
            <div className='container'>
                <Logo />
                <form>
                    <h2>Recuperar Senha</h2>
                    <p style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-secondary)' }}>
                        Digite o e-mail da sua conta para receber um código de recuperação.
                    </p>
                    <input type='email' placeholder='Seu e-mail cadastrado' required ref={recoveryEmailRef} />
                    <button type='button' onClick={handleRequestCode} disabled={isLoading}>
                        {isLoading ? 'A enviar...' : 'Enviar Código'}
                    </button>
                    <div className='footer'>
                        <p onClick={() => setRecoveryStep(0)} style={{ color: 'var(--primary-green)', cursor: 'pointer', fontWeight: 'bold' }}>
                            Voltar para o Login
                        </p>
                    </div>
                </form>
            </div>
        );
    }

    if (recoveryStep === 2) {
        // ... (Mesmo código do ecrã 2)
        return (
            <div className='container'>
                <Logo />
                <form>
                    <h2>Nova Senha</h2>
                    <p style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-secondary)' }}>
                        Digite o código de 6 dígitos que enviámos para o seu e-mail.
                    </p>
                    <input type='text' placeholder='Código de 6 dígitos' required ref={recoveryCodeRef} maxLength="6" autoComplete="one-time-code" />
                    <input type='password' placeholder='Digite a nova senha' required ref={recoveryNewPasswordRef} autoComplete="new-password" />
                    <button type='button' onClick={handleResetPassword} disabled={isLoading}>
                        {isLoading ? 'A validar...' : 'Alterar Senha'}
                    </button>
                    <div className='footer'>
                        <p onClick={() => setRecoveryStep(0)} style={{ color: 'var(--primary-green)', cursor: 'pointer', fontWeight: 'bold' }}>
                            Cancelar e voltar
                        </p>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className='container'>
            <Logo />
            {/* NOVO: Coloquei o onSubmit aqui no form */}
            <form onSubmit={handleLogin}>
                <h2>Acesse sua conta</h2>
                <input name='email' type='email' placeholder='E-mail' required ref={inputEmail} />
                <input name='senha' type='password' placeholder='Senha' required ref={inputSenha} />
                
                <div className="form-options">
                    <label className="remember-me">
                        <input 
                            type="checkbox" 
                            checked={rememberMe} 
                            onChange={(e) => setRememberMe(e.target.checked)} 
                        />
                        Lembrar meu e-mail
                    </label>
                    <span className="forgot-password" onClick={() => setRecoveryStep(1)}>
                        Esqueceu a senha?
                    </span>
                </div>

                {/* NOVO: Mudei para type='submit' */}
                <button type='submit' disabled={isLoading}>
                    {isLoading ? 'A carregar...' : 'Entrar'}
                </button>
                
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