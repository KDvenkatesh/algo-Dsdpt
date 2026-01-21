import React, { useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Gamepad2, Coins, DollarSign, Wallet, Star, Swords, ShoppingBag, Settings, RefreshCw, Send, X, AlertTriangle, Home as HomeIcon, User, Layers, Check, QrCode, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { PeraWalletConnect } from '@perawallet/connect';

// --- CONSTANTS AND MOCK DATA ---
const INITIAL_HUB_STATE = {
    treasuryAlgo: 500000, // MicroAlgos
    entryFee: 100000,
    rewardAmount: 150000,
    lowEntryFee: 5000,
    itemPriceMint: 50,
};

const PAGES = {
    HOME: 'home',
    DASHBOARD: 'dashboard',
    PROFILE: 'profile',
};

// Mock the current user address
const MOCK_USER_ID = typeof crypto !== 'undefined' ? crypto.randomUUID() : 'player-mock-user-id';

// Helper to format MicroAlgos to Algos (2 decimal places for display)
const formatAlgo = (microAlgos: number): string => (microAlgos / 1000000).toFixed(6);

// Helper to format a number with commas
const formatNumber = (num: number): string => num.toLocaleString();

// --- PERA WALLET SETUP ---
const peraWallet = new PeraWalletConnect();

// --- COMPONENTS ---

/**
 * Custom Modal Component for Alerts/Confirmations (replacing alert/confirm)
 */
const Modal = ({ title, message, isOpen, onClose, onConfirm, showConfirm = false, confirmText = "Confirm" }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-purple-600 rounded-xl p-6 shadow-2xl w-full max-w-md transform transition-all scale-100 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition duration-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                    >
                        {showConfirm ? "Cancel" : "Close"}
                    </button>
                    {showConfirm && (
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition duration-200 transform hover:scale-[1.02]"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Reusable Card Component
 */
const StatCard = ({ title, value, icon: Icon, unit = "", color = "text-purple-400", subtext = "" }: any) => (
    <div className="bg-gray-700 p-4 rounded-xl shadow-lg border border-gray-600 hover:bg-gray-600 transition duration-300 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</h4>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className="mt-3">
            <p className="text-3xl font-extrabold text-white">
                {value}
                <span className="text-sm font-normal ml-1 text-gray-400">{unit}</span>
            </p>
            {subtext && <p className="text-xs mt-1 text-gray-400">{subtext}</p>}
        </div>
    </div>
);

/**
 * QR Code Component
 */
const QRCodeDisplay = ({ value, size = 256 }: any) => {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    useEffect(() => {
        QRCode.toDataURL(value, {
            width: size,
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' },
            errorCorrectionLevel: 'H',
        })
            .then((url: string) => setQrDataUrl(url))
            .catch((err: any) => console.error('QR Code generation error:', err));
    }, [value, size]);

    if (!qrDataUrl) {
        return <div className="bg-gray-300 rounded-lg" style={{ width: size, height: size }} />;
    }

    return <img src={qrDataUrl} alt="QR Code" className="rounded-lg" />;
};

// --- NAVIGATION BAR ---

const Navigation = ({ activePage, setActivePage, isAdmin }: any) => (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-purple-800/50 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
                GamesHub
            </h1>
            <nav className="flex space-x-2 sm:space-x-4">
                <NavButton
                    label="Home"
                    icon={HomeIcon}
                    isActive={activePage === PAGES.HOME}
                    onClick={() => setActivePage(PAGES.HOME)}
                />
                <NavButton
                    label="Dashboard"
                    icon={Gamepad2}
                    isActive={activePage === PAGES.DASHBOARD}
                    onClick={() => setActivePage(PAGES.DASHBOARD)}
                />
                <NavButton
                    label="Profile"
                    icon={User}
                    isActive={activePage === PAGES.PROFILE}
                    onClick={() => setActivePage(PAGES.PROFILE)}
                />
                {isAdmin && (
                    <NavButton
                        label="Admin"
                        icon={Settings}
                        isActive={false} // Admin panel integrated into dashboard
                        onClick={() => setActivePage(PAGES.DASHBOARD)}
                        className="text-red-400 border-red-400/50"
                    />
                )}
            </nav>
        </div>
    </header>
);

const NavButton = ({ label, icon: Icon, isActive, onClick, className = '' }: any) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-semibold rounded-lg transition duration-300 flex items-center space-x-1 border ${className} ${
            isActive
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/40'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span className="hidden sm:inline">{label}</span>
    </button>
);

// --- PAGE COMPONENTS ---

const HomePage = ({ setActivePage }: any) => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [showMobileQR, setShowMobileQR] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Check if wallet is already connected on mount
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const accounts = await peraWallet.reconnectSession();
                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setWalletConnected(true);
                }
            } catch (error) {
                console.log('No previous wallet session found');
            }
        };

        checkConnection();

        // Subscribe to connect event
        peraWallet.connector?.on('connect', (accounts: string[]) => {
            console.log('Wallet connected:', accounts);
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setWalletConnected(true);
                setShowMobileQR(false);
                // Redirect to dashboard after connection
                setTimeout(() => setActivePage(PAGES.DASHBOARD), 500);
            }
        });

        // Subscribe to disconnect event
        peraWallet.connector?.on('disconnect', () => {
            console.log('Wallet disconnected');
            setWalletConnected(false);
            setWalletAddress('');
        });

        return () => {
            // Cleanup listeners
            peraWallet.connector?.off('connect');
            peraWallet.connector?.off('disconnect');
        };
    }, []);

    const handleConnectPera = async () => {
        setIsConnecting(true);
        try {
            const accounts = await peraWallet.connect();
            if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setWalletConnected(true);
                setShowMobileQR(false);
                // Auto-navigate to dashboard after connection
                setTimeout(() => setActivePage(PAGES.DASHBOARD), 500);
            }
        } catch (error) {
            console.error('Error connecting to Pera Wallet:', error);
            // If connection fails, show QR code option
            setShowMobileQR(true);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleShowMobileQR = async () => {
        setIsConnecting(true);
        try {
            // Initiate connection to generate URI
            await peraWallet.connect();
        } catch (error) {
            console.log('QR code displayed, waiting for scan...');
        } finally {
            setShowMobileQR(true);
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await peraWallet.disconnect();
            setWalletConnected(false);
            setWalletAddress('');
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4 pt-16 relative overflow-hidden">
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.7); }
                    50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.9); }
                }
                .glow-pulse {
                    animation: pulse-glow 3s infinite alternate;
                }
                @keyframes slideInUp {
                    0% { transform: translateY(50px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-slideInUp {
                    animation: slideInUp 0.8s ease-out forwards;
                }
            `}</style>

            <div className="text-center animate-slideInUp" style={{animationDelay: '0.2s'}}>
                <h2 className="text-6xl sm:text-7xl font-extrabold text-white mb-4 leading-tight">
                    Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">GamesHub</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                    Your decentralized platform for high-stakes gaming and earning MINT tokens on Algorand.
                </p>

                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-purple-600 glow-pulse max-w-lg mx-auto">
                    {walletConnected ? (
                        <>
                            <p className="text-yellow-400 text-lg mb-8">
                                Wallet Connected Successfully!
                            </p>
                            
                            <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-center space-x-2 text-green-400">
                                    <Check className="w-5 h-5" />
                                    <span className="font-semibold">Wallet Connected</span>
                                </div>
                                <p className="text-sm text-green-300 mt-2 break-all">{walletAddress}</p>
                            </div>
                            <button
                                onClick={() => setActivePage(PAGES.DASHBOARD)}
                                className="w-full px-8 py-3 bg-pink-600 text-white font-extrabold text-lg rounded-xl shadow-lg hover:bg-pink-700 transition duration-300 transform hover:scale-105 active:scale-95"
                            >
                                Launch Dashboard <Gamepad2 className="w-5 h-5 ml-2 inline" />
                            </button>
                            <button
                                onClick={handleDisconnect}
                                className="w-full px-8 py-2 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition duration-300 mt-3"
                            >
                                Disconnect Wallet
                            </button>
                        </>
                    ) : showMobileQR ? (
                        <>
                            <p className="text-yellow-400 text-lg mb-6">
                                Scan with Pera Wallet Mobile App
                            </p>
                            
                            <div className="bg-white p-6 rounded-xl flex justify-center mb-6">
                                {peraWallet.connector?.uri ? (
                                    <QRCodeDisplay value={peraWallet.connector.uri} size={256} />
                                ) : (
                                    <div className="w-64 h-64 bg-gray-300 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-600">Generating QR code...</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-300 text-sm mb-6">
                                Open Pera Wallet on your mobile device and scan this QR code to connect.
                            </p>

                            <button
                                onClick={() => setShowMobileQR(false)}
                                className="w-full px-6 py-2 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition duration-300"
                            >
                                Back
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-yellow-400 text-lg mb-8">
                                Connect your Pera Wallet
                            </p>
                            
                            <div className="space-y-4">
                                <button
                                    onClick={handleConnectPera}
                                    disabled={isConnecting}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Wallet className="w-6 h-6" />
                                    <span>{isConnecting ? 'Connecting...' : 'Connect with Pera Wallet'}</span>
                                </button>

                                <button
                                    onClick={handleShowMobileQR}
                                    disabled={isConnecting}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Smartphone className="w-6 h-6" />
                                    <span>{isConnecting ? 'Generating QR...' : 'Connect with Mobile App (QR)'}</span>
                                </button>

                                <p className="text-gray-400 text-sm mt-6">
                                    Don't have Pera Wallet? <a href="https://perawallet.app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Download here</a>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProfilePage = ({ hubState, playerState }: any) => {
    const GlobalStats = useMemo(() => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                title="Treasury ALGO"
                value={formatNumber(formatAlgo(hubState.treasuryAlgo))}
                unit="ALGO"
                icon={Wallet}
                color="text-green-400"
            />
            <StatCard
                title="High Stakes Fee"
                value={formatNumber(formatAlgo(hubState.entryFee))}
                unit="ALGO"
                icon={DollarSign}
                color="text-red-400"
            />
            <StatCard
                title="Win Payout"
                value={formatNumber(formatAlgo(hubState.rewardAmount))}
                unit="ALGO"
                icon={Coins}
                color="text-blue-400"
            />
            <StatCard
                title="Item Price"
                value={formatNumber(hubState.itemPriceMint)}
                unit="MINT"
                icon={ShoppingBag}
                color="text-pink-400"
            />
        </div>
    ), [hubState]);

    const PlayerStats = useMemo(() => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Your ALGO Balance"
                value={formatNumber(formatAlgo(playerState.algoBalance))}
                unit="ALGO"
                icon={Wallet}
                color="text-green-500"
                subtext="Box storage balance"
            />
            <StatCard
                title="MINT Tokens"
                value={formatNumber(playerState.mintBalance)}
                unit="MINT"
                icon={Star}
                color="text-yellow-500"
                subtext="In-game currency"
            />
            <StatCard
                title="Wins Score"
                value={formatNumber(playerState.score)}
                unit="Games"
                icon={Swords}
                color="text-purple-500"
                subtext="High-stakes leaderboard metric"
            />
            <StatCard
                title="Owned Items"
                value={playerState.hasItem1 ? '1 / Item #1' : '0'}
                unit="Unique"
                icon={ShoppingBag}
                color="text-pink-500"
                subtext="Store purchases"
            />
        </div>
    ), [playerState]);

    return (
        <div className="p-4 sm:p-8 pt-24 max-w-7xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-100 mb-6 flex items-center">
                <User className="w-8 h-8 mr-3 text-purple-400" />
                Player Profile
            </h2>

            <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
                 <span className="text-xs text-gray-500 mr-2">Player ID:</span>
                <span className="text-sm font-mono text-yellow-400 break-all">{MOCK_USER_ID}</span>
            </div>

            <h3 className="text-2xl font-bold text-gray-200 mb-4">Your Balances & Score</h3>
            {PlayerStats}

            <h3 className="text-2xl font-bold text-gray-200 mt-8 mb-4">Hub Global Statistics</h3>
            {GlobalStats}
        </div>
    );
}

const DashboardPage = ({
    hubState, playerState, isAdmin,
    showStatus, openModal, closeModal,
    handleDepositAlgo, handleWithdrawAlgo, handleEnterGame,
    handleWinGame, handleCoinCollectionEnd, handleBuyItem,
    handleSetFee, handleSetMintPrice, handleAddMintTokens,
    setIsAdmin
}: any) => {
    const GameActions = useCallback(() => (
        <div className="bg-gray-800 p-6 rounded-xl shadow-inner border border-purple-700/50">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Gamepad2 className="w-6 h-6 mr-2 text-purple-400" />
                Game Lobby Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Deposit */}
                <ActionButton
                    label="Deposit 5 ALGO"
                    onClick={() => handleDepositAlgo(5000000)}
                    icon={Coins}
                    color="green"
                />

                {/* Withdraw */}
                <ActionButton
                    label="Withdraw 1 ALGO"
                    onClick={() => handleWithdrawAlgo(1000000)}
                    icon={Send}
                    color="red"
                />

                {/* High Stakes Entry */}
                <ActionButton
                    label={`High Stakes (${formatAlgo(hubState.entryFee)} ALGO)`}
                    onClick={() => handleEnterGame(false)}
                    icon={Swords}
                    color="purple"
                />

                {/* High Stakes Win */}
                <ActionButton
                    label={`Simulate Win (+${formatAlgo(hubState.rewardAmount)} ALGO)`}
                    onClick={handleWinGame}
                    icon={Star}
                    color="yellow"
                />

                {/* Low Stakes Entry */}
                <ActionButton
                    label={`Coin Game (${formatAlgo(hubState.lowEntryFee)} ALGO)`}
                    onClick={() => handleEnterGame(true)}
                    icon={Coins}
                    color="blue"
                />

                {/* Coin Game End */}
                <ActionButton
                    label="End Coin Game (Get MINT)"
                    onClick={handleCoinCollectionEnd}
                    icon={RefreshCw}
                    color="pink"
                />
            </div>
        </div>
    ), [hubState, handleDepositAlgo, handleWithdrawAlgo, handleEnterGame, handleWinGame, handleCoinCollectionEnd]);

    const Store = useCallback(() => (
        <div className="bg-gray-800 p-6 rounded-xl shadow-inner border border-purple-700/50">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <ShoppingBag className="w-6 h-6 mr-2 text-pink-400" />
                In-Game Store
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg shadow-xl transition duration-300 ${playerState.hasItem1 ? 'bg-green-800 border-green-500' : 'bg-gray-700 border-gray-500 hover:scale-[1.03]'}`}>
                    <h4 className="text-xl font-bold text-white">Item #1: Speed Boost</h4>
                    <p className="text-gray-300 mt-1 mb-3 text-sm">A permanent upgrade for all future games.</p>
                    <p className="text-2xl font-extrabold text-yellow-400 flex items-center">
                        {hubState.itemPriceMint} <Star className="w-5 h-5 ml-1" />
                    </p>
                    <button
                        onClick={() => handleBuyItem(1, hubState.itemPriceMint)}
                        disabled={playerState.hasItem1}
                        className={`mt-4 w-full py-2 rounded-lg font-semibold transition duration-300 ${
                            playerState.hasItem1
                                ? 'bg-green-600 text-white cursor-not-allowed'
                                : 'bg-pink-600 text-white hover:bg-pink-700 transform active:scale-95'
                        }`}
                    >
                        {playerState.hasItem1 ? 'Purchased (Owned)' : 'Buy Now'}
                    </button>
                </div>
                {/* Add more mock items here */}
            </div>
        </div>
    ), [playerState.hasItem1, hubState.itemPriceMint, handleBuyItem]);

    const AdminPanel = useCallback(() => {
        const [feeInput, setFeeInput] = useState(formatAlgo(hubState.entryFee));
        const [lowFeeInput, setLowFeeInput] = useState(formatAlgo(hubState.lowEntryFee));
        const [priceInput, setPriceInput] = useState(hubState.itemPriceMint.toString());
        const [mintAmountInput, setMintAmountInput] = useState('100');

        return (
            <div className="bg-gray-800 p-6 rounded-xl shadow-inner border border-red-600/50 mt-8">
                <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
                    <Settings className="w-6 h-6 mr-2" />
                    Admin Control Panel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AdminInput
                        label="Set High Entry Fee (ALGO)"
                        value={feeInput}
                        onChange={(e: any) => setFeeInput(e.target.value)}
                        onSave={() => handleSetFee('entryFee', feeInput)}
                        unit="ALGO"
                    />
                    <AdminInput
                        label="Set Low Entry Fee (ALGO)"
                        value={lowFeeInput}
                        onChange={(e: any) => setLowFeeInput(e.target.value)}
                        onSave={() => handleSetFee('lowEntryFee', lowFeeInput)}
                        unit="ALGO"
                    />
                    <AdminInput
                        label="Set Item Price (MINT)"
                        value={priceInput}
                        onChange={(e: any) => setPriceInput(e.target.value)}
                        onSave={() => handleSetMintPrice(priceInput)}
                        unit="MINT"
                    />
                    <AdminInput
                        label="Add MINT Tokens to Player"
                        value={mintAmountInput}
                        onChange={(e: any) => setMintAmountInput(e.target.value)}
                        onSave={() => handleAddMintTokens(mintAmountInput)}
                        unit="MINT"
                        isAction
                    />
                </div>
            </div>
        );
    }, [hubState, handleSetFee, handleSetMintPrice, handleAddMintTokens]);

    return (
        <div className="p-4 sm:p-8 pt-24 max-w-7xl mx-auto">
            {/* Game Actions */}
            <div className="mb-8">
                {GameActions()}
            </div>

            {/* Store */}
            <div className="mb-8">
                {Store()}
            </div>

            {/* Admin Toggle */}
            <div className="mt-8 flex items-center justify-start">
                <label htmlFor="admin-toggle" className="text-gray-400 mr-3">Enable Admin Mode</label>
                <input
                    type="checkbox"
                    id="admin-toggle"
                    checked={isAdmin}
                    onChange={() => setIsAdmin((prev: boolean) => !prev)}
                    className="h-5 w-5 rounded border-gray-300 text-purple-600 shadow-sm focus:ring-purple-500 transition duration-200"
                />
            </div>

            {/* Admin Panel */}
            {isAdmin && AdminPanel()}
        </div>
    );
};

// --- CORE APP COMPONENT ---

const App = () => {
    // --- State Management ---
    const [activePage, setActivePage] = useState(PAGES.HOME);
    const [hubState, setHubState] = useState(INITIAL_HUB_STATE);
    const [playerState, setPlayerState] = useState({
        algoBalance: 10000000, // 10 ALGO
        mintBalance: 100,
        score: 42,
        hasItem1: false,
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({});

    // --- Utility Functions (Passed as Props) ---

    const showStatus = useCallback((message: string, type: string = 'success') => {
        setStatusMessage({ message, type });
        setTimeout(() => setStatusMessage({ message: '', type: '' }), 5000);
    }, []);

    const openModal = useCallback((title: string, message: string, onConfirm: any, showConfirm: boolean = false, confirmText: string = "Confirm") => {
        setModalContent({ title, message, onConfirm, showConfirm, confirmText });
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalContent({});
    }, []);

    // --- Simulated Contract Logic (ABIMethods) ---

    const handleDepositAlgo = useCallback((amountMicroAlgos: number) => {
        setPlayerState(prev => ({
            ...prev,
            algoBalance: prev.algoBalance + amountMicroAlgos
        }));
        setHubState(prev => ({
            ...prev,
            treasuryAlgo: prev.treasuryAlgo + amountMicroAlgos
        }));
    showStatus(`Successfully deposited ${formatAlgo(amountMicroAlgos)} ALGO.`, 'success');
    }, [showStatus]);

    const handleWithdrawAlgo = useCallback((amountMicroAlgos: number) => {
        if (playerState.algoBalance < amountMicroAlgos) {
            showStatus('Withdrawal failed: Insufficient ALGO balance.', 'error');
            return;
        }
        if (hubState.treasuryAlgo < amountMicroAlgos) {
            showStatus('Withdrawal failed: Treasury balance insufficient.', 'error');
            return;
        }

        setPlayerState(prev => ({
            ...prev,
            algoBalance: prev.algoBalance - amountMicroAlgos
        }));
        setHubState(prev => ({
            ...prev,
            treasuryAlgo: prev.treasuryAlgo - amountMicroAlgos
        }));
    showStatus(`Successfully withdrew ${formatAlgo(amountMicroAlgos)} ALGO.`, 'success');
    }, [playerState.algoBalance, hubState.treasuryAlgo, showStatus]);

    const handleEnterGame = useCallback((isCoinGame = false) => {
        const fee = isCoinGame ? hubState.lowEntryFee : hubState.entryFee;
        if (playerState.algoBalance < fee) {
            openModal('Transaction Failed', `You need ${formatAlgo(fee)} ALGO to enter this game.`, null, false);
            return;
        }

        const confirmAction = () => {
            setPlayerState(prev => ({
                ...prev,
                algoBalance: prev.algoBalance - fee,
            }));
            setHubState(prev => ({
                ...prev,
                treasuryAlgo: prev.treasuryAlgo + fee
            }));
            closeModal();
            showStatus(`Entered the ${isCoinGame ? 'Coin Collection' : 'High Stakes'} game! Fee: ${formatAlgo(fee)} ALGO.`, 'info');
        };

        openModal('Confirm Entry', `Are you sure you want to spend ${formatAlgo(fee)} ALGO to enter the ${isCoinGame ? 'Coin Collection' : 'High Stakes'} game?`, confirmAction, true, "Enter Game");

    }, [playerState.algoBalance, hubState.entryFee, hubState.lowEntryFee, showStatus, openModal, closeModal]);

    const handleWinGame = useCallback(() => {
        const reward = hubState.rewardAmount;
        const mintReward = 5;

        if (hubState.treasuryAlgo < reward) {
            showStatus('Win failed: Treasury cannot cover the reward.', 'error');
            return;
        }

        let algoCredit = 0;
        let mintNew = playerState.mintBalance + mintReward;
        const thousand = 1000;
        const algoPerThousand = 1;

        if (mintNew >= thousand) {
            const numThousands = Math.floor(mintNew / thousand);
            const mintRemaining = mintNew % thousand;
            algoCredit = numThousands * algoPerThousand * 1000000; // Convert to MicroAlgos
            mintNew = mintRemaining;

            if (hubState.treasuryAlgo < reward + algoCredit) {
                showStatus('Win failed: Treasury cannot cover reward + MINT conversion.', 'error');
                return;
            }

            setHubState(prev => ({
                ...prev,
                treasuryAlgo: prev.treasuryAlgo - algoCredit,
            }));
        }

        setPlayerState(prev => ({
            ...prev,
            algoBalance: prev.algoBalance + reward + algoCredit,
            mintBalance: mintNew,
            score: prev.score + 1,
        }));
        setHubState(prev => ({
            ...prev,
            treasuryAlgo: prev.treasuryAlgo - reward,
        }));

    showStatus(`VICTORY! Won ${formatAlgo(reward)} ALGO, ${mintReward} MINT, and converted ${formatAlgo(algoCredit)} ALGO. Score +1.`, 'success');
    }, [playerState.mintBalance, hubState.rewardAmount, hubState.treasuryAlgo, showStatus]);

    const handleCoinCollectionEnd = useCallback(() => {
        const coinsCollected = Math.floor(Math.random() * 50000) + 10000; // Mock coins collected (10k to 60k)
        const units = Math.floor(coinsCollected / 10000);
        const mintAward = units * 5;

        if (mintAward > 0) {
            setPlayerState(prev => ({
                ...prev,
                mintBalance: prev.mintBalance + mintAward,
            }));
            showStatus(`Game Over: Collected ${formatNumber(coinsCollected)} coins and earned ${mintAward} MINT tokens.`, 'success');
        } else {
            showStatus(`Game Over: Collected ${formatNumber(coinsCollected)} coins. No MINT awarded this time.`, 'info');
        }
    }, [showStatus]);

    const handleBuyItem = useCallback((itemId: number, price: number) => {
        if (playerState.hasItem1) {
            showStatus('You already own this item!', 'info');
            return;
        }
        if (playerState.mintBalance < price) {
            openModal('Purchase Failed', `You need ${price} MINT tokens to buy this item. You only have ${playerState.mintBalance}.`, null, false);
            return;
        }

        const confirmAction = () => {
            setPlayerState(prev => ({
                ...prev,
                mintBalance: prev.mintBalance - price,
                hasItem1: true,
            }));
            closeModal();
            showStatus(`Item ${itemId} purchased for ${price} MINT!`, 'success');
        };

        openModal('Confirm Purchase', `Are you sure you want to spend ${price} MINT tokens on Item ${itemId}?`, confirmAction, true, "Buy Item");

    }, [playerState.mintBalance, playerState.hasItem1, showStatus, openModal, closeModal]);

    // --- Admin Handlers ---

    const handleSetFee = (key: string, value: string) => {
        const microAlgos = Math.max(0, Math.floor(parseFloat(value) * 1000000));
        setHubState(prev => ({ ...prev, [key]: microAlgos }));
        showStatus(`Updated ${key} to ${formatAlgo(microAlgos)} ALGO.`, 'info');
    };

    const handleSetMintPrice = (value: string) => {
        const price = Math.max(0, parseInt(value));
        setHubState(prev => ({ ...prev, itemPriceMint: price }));
        showStatus(`Updated Item Price to ${price} MINT.`, 'info');
    };

    const handleAddMintTokens = (amount: string) => {
        const mintAmount = Math.max(0, parseInt(amount));
        setPlayerState(prev => ({
            ...prev,
            mintBalance: prev.mintBalance + mintAmount
        }));
        showStatus(`Added ${mintAmount} MINT tokens (Admin action).`, 'success');
    };

    // --- Page Renderer ---

    const PageRenderer = () => {
        switch (activePage) {
            case PAGES.HOME:
                return <HomePage setActivePage={setActivePage} />;
            case PAGES.PROFILE:
                return <ProfilePage hubState={hubState} playerState={playerState} />;
            case PAGES.DASHBOARD:
                return (
                    <DashboardPage
                        hubState={hubState} playerState={playerState} isAdmin={isAdmin}
                        showStatus={showStatus} openModal={openModal} closeModal={closeModal}
                        handleDepositAlgo={handleDepositAlgo} handleWithdrawAlgo={handleWithdrawAlgo}
                        handleEnterGame={handleEnterGame} handleWinGame={handleWinGame}
                        handleCoinCollectionEnd={handleCoinCollectionEnd} handleBuyItem={handleBuyItem}
                        handleSetFee={handleSetFee} handleSetMintPrice={handleSetMintPrice}
                        handleAddMintTokens={handleAddMintTokens} setIsAdmin={setIsAdmin}
                    />
                );
            default:
                return <HomePage setActivePage={setActivePage} />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 font-inter text-white pb-8">
            <Modal
                title={modalContent.title}
                message={modalContent.message}
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={modalContent.onConfirm}
                showConfirm={modalContent.showConfirm}
                confirmText={modalContent.confirmText}
            />

            {/* Navigation Bar */}
            <Navigation activePage={activePage} setActivePage={setActivePage} isAdmin={isAdmin} />

            {/* Status Message (Fixed Position for visibility) */}
            {statusMessage.message && (
                <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-2xl transition-all duration-300 transform animate-slideInRight ${
                    statusMessage.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-600' :
                    statusMessage.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-600' :
                    'bg-blue-500/20 text-blue-300 border border-blue-600'
                } max-w-sm w-full`}>
                    <p className="font-medium">{statusMessage.message}</p>
                </div>
            )}

            <main>
                {PageRenderer()}
            </main>
        </div>
    );
};

// --- Helper Components for Styling (Moved outside App for clarity) ---

const ActionButton = ({ label, onClick, icon: Icon, color }: any) => {
    const colorClasses = {
        green: 'bg-green-600 hover:bg-green-700',
        red: 'bg-red-600 hover:bg-red-700',
        purple: 'bg-purple-600 hover:bg-purple-700',
        yellow: 'bg-yellow-600 hover:bg-yellow-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
        pink: 'bg-pink-600 hover:bg-pink-700',
    };
    const shadowClasses = {
        green: 'shadow-green-500/50',
        red: 'shadow-red-500/50',
        purple: 'shadow-purple-500/50',
        yellow: 'shadow-yellow-500/50',
        blue: 'shadow-blue-500/50',
        pink: 'shadow-pink-500/50',
    };

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-xl font-bold text-white transition duration-300 transform hover:scale-[1.05] active:scale-95 ${colorClasses[color as keyof typeof colorClasses]} shadow-md ${shadowClasses[color as keyof typeof shadowClasses]} w-full`}
        >
            <Icon className="w-8 h-8 mb-2" />
            <span className="text-sm text-center">{label}</span>
        </button>
    );
};

const AdminInput = ({ label, value, onChange, onSave, unit, isAction = false }: any) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-300 mb-1">{label}</label>
        <div className="flex space-x-2">
            <input
                type="number"
                step={unit === 'ALGO' ? '0.000001' : '1'}
                value={value}
                onChange={onChange}
                className="flex-grow bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
                onClick={onSave}
                className={`py-2 px-4 rounded-lg font-semibold transition duration-200 ${
                    isAction ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
            >
                {isAction ? 'Perform Action' : 'Save'}
            </button>
        </div>
        <span className="text-xs text-gray-500 mt-1">{unit}</span>
    </div>
);

export default App;
