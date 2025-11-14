document.addEventListener('DOMContentLoaded', () => {

    // --- 1. REFERENCIAS A ELEMENTOS DEL DOM ---
    const leafCountDisplay = document.getElementById('leaf-count');
    const hpsCountDisplay = document.getElementById('hps-count');
    const hpcCountDisplay = document.getElementById('hpc-count');
    const clickerButton = document.getElementById('clicker-button');
    const clickerSection = document.querySelector('.clicker-section'); 
    const storeContainer = document.getElementById('store-container');
    const sceneryDisplay = document.getElementById('scenery-display');
    const clickerArea = document.querySelector('.clicker-area');
    const music = document.getElementById('music-lofi');
    const clickSound = document.getElementById('sound-click');
    const buySound = document.getElementById('sound-buy');
    const musicToggleBtn = document.getElementById('music-toggle');
    const sfxToggleBtn = document.getElementById('sfx-toggle');
    const buyAmountToggleBtn = document.getElementById('buy-amount-toggle');

    // Pestañas y Paneles
    const tabStore = document.getElementById('tab-store');
    const tabAchievements = document.getElementById('tab-achievements');
    const tabPrestige = document.getElementById('tab-prestige');
    const storePanel = document.getElementById('store-panel');
    const achievementsPanel = document.getElementById('achievements-panel');
    const achievementsContainer = document.getElementById('achievements-container');
    const boostTimerDisplay = document.getElementById('boost-timer');
    
    // Prestigio
    const prestigePanel = document.getElementById('prestige-panel');
    const prestigeGainDisplay = document.getElementById('prestige-gain');
    const prestigeTotalLeavesDisplay = document.getElementById('prestige-leaves-total');
    const prestigeResetButton = document.getElementById('prestige-reset-button');
    const prestigeUpgradeContainer = document.getElementById('prestige-upgrade-container');
    const bellotaCountDisplay = document.getElementById('bellota-count');

    // Clima
    const weatherEventBar = document.getElementById('weather-event-bar');
    const rainContainer = document.getElementById('rain-container');
    const sunOverlay = document.getElementById('sun-overlay');
    // *** NUEVO: Referencia al contenedor de viento ***
    const windContainer = document.getElementById('wind-container');


    // --- 2. ESTADO DEL JUEGO ---
    let leaves = 0;
    let leavesPerSecond = 0;
    let leavesPerClick = 1;
    let baseClickValue = 1;
    let lastSaveTime = Date.now();
    
    let isMusicEnabled = true;
    let isSfxEnabled = true;
    const buyAmountModes = [1, 10, 'max'];
    let currentBuyModeIndex = 0;

    // Multiplicadores y Boosts
    let globalMultiplier = 1;
    let boostEndTime = 0;
    let clickFrenzyMultiplier = 7;

    // Estado de Prestigio
    let bellotas = 0;
    let totalLeavesPrestige = 0; // Hojas totales en esta run
    const PRESTIGE_REQ = 1_000_000_000; // 1 Billón

    // Eventos de Clima
    let currentWeatherEvent = null;
    let eventEndTime = 0;
    const weatherEvents = [
        { id: 'rain', name: '🌧️ Lluvia Ligera', duration: 60, target: 'hps', multiplier: 1.5, text: '¡La lluvia aumenta el HPS x1.5!' },
        { id: 'wind', name: '💨 Racha de Viento', duration: 20, target: 'click', multiplier: 3, text: '¡El viento triplica el valor de tus Clics!' },
        { id: 'sun', name: '☀️ Día Soleado', duration: 80, target: 'all', multiplier: 2, text: '¡Día perfecto! ¡Toda la producción x2!' }
    ];

    // Contadores Globales
    let totalLeavesCollected = 0;
    let totalClicks = 0;
    let totalGoldenLeavesClicked = 0;

    // Multiplicadores de Logros
    let achievementMultipliers = {
        cesto: 1, ardilla: 1, arbol: 1, viento: 1,
        guantes: 1, rastrillo: 1, soplador: 1
    };

    // Variables de Hoja Dorada
    let goldenLeafSpawnTime = 40;
    let goldenLeafRewardMultiplier = 1;
    let goldenLeafDuration = 10;

    // Definición de Logros
    const achievements = {
        'leaf_10k': { name: 'Bolsillo Lleno', desc: 'Recoge un total de 10,000 hojas.', icon: '💰', unlocked: false, condition: () => totalLeavesCollected >= 10000, reward: { text: '+1% HPS/HPC global', effect: () => globalMultiplier *= 1.01 }},
        'leaf_1M': { name: 'Millonario de Hojas', desc: 'Recoge un total de 1,000,000 hojas.', icon: '🤑', unlocked: false, condition: () => totalLeavesCollected >= 1000000, reward: { text: '+2% HPS/HPC global', effect: () => globalMultiplier *= 1.02 }},
        'leaf_1B': { name: 'Magnate de Hojas', desc: 'Recoge un total de 1 Billón de hojas.', icon: '👑', unlocked: false, condition: () => totalLeavesCollected >= 1000000000, reward: { text: '+10% HPS/HPC global', effect: () => globalMultiplier *= 1.10 }},
        'click_100': { name: 'Dedo Ágil', desc: 'Haz clic 100 veces.', icon: '👆', unlocked: false, condition: () => totalClicks >= 100, reward: { text: '+1 al valor base de Clic', effect: () => baseClickValue++ }},
        'click_1000': { name: 'Dedo Dorado', desc: 'Haz clic 1,000 veces.', icon: '👉', unlocked: false, condition: () => totalClicks >= 1000, reward: { text: '+10 al valor base de Clic', effect: () => baseClickValue += 10 }},
        'click_100k': { name: 'Cliclista Olímpico', desc: 'Haz clic 100,000 veces.', icon: '🥇', unlocked: false, condition: () => totalClicks >= 100000, reward: { text: '+100 al valor base de Clic', effect: () => baseClickValue += 100 }},
        'hps_100': { name: 'Piloto Automático', desc: 'Alcanza 100 HPS.', icon: '⏱️', unlocked: false, condition: () => leavesPerSecond >= 100, reward: { text: '+2% HPS/HPC global', effect: () => globalMultiplier *= 1.02 }},
        'hps_1k': { name: 'Velocidad de Escape', desc: 'Alcanza 1,000 HPS.', icon: '🚀', unlocked: false, condition: () => leavesPerSecond >= 1000, reward: { text: 'El Frenesí de Clics ahora es x10', effect: () => clickFrenzyMultiplier = 10 }},
        'cesto_50': { name: 'Maestro de Cestos', desc: 'Compra 50 Cestos.', icon: '🧺', unlocked: false, condition: () => (upgrades.find(u => u.id === 'cesto')?.count || 0) >= 50, reward: { text: 'Los Cestos x2', effect: () => achievementMultipliers.cesto *= 2 }},
        'ardilla_50': { name: 'Líder de la Manada', desc: 'Compra 50 Ardillas.', icon: '🐿️', unlocked: false, condition: () => (upgrades.find(u => u.id === 'ardilla')?.count || 0) >= 50, reward: { text: 'Las Ardillas x2', effect: () => achievementMultipliers.ardilla *= 2 }},
        'arbol_50': { name: 'Bosque Creciente', desc: 'Compra 50 Árboles.', icon: '🌳', unlocked: false, condition: () => (upgrades.find(u => u.id === 'arbol')?.count || 0) >= 50, reward: { text: 'Los Árboles x2', effect: () => achievementMultipliers.arbol *= 2 }},
        'golden_1': { name: '¡Qué Suerte!', desc: 'Haz clic en 1 Hoja Dorada.', icon: '✨', unlocked: false, condition: () => totalGoldenLeavesClicked >= 1, reward: { text: 'Hojas Doradas 10% más rápido', effect: () => goldenLeafSpawnTime *= 0.9 }},
        'golden_10': { name: 'Cazador de Oro', desc: 'Haz clic en 10 Hojas Doradas.', icon: '🌟', unlocked: false, condition: () => totalGoldenLeavesClicked >= 10, reward: { text: 'Recompensas de Hojas Doradas x2', effect: () => goldenLeafRewardMultiplier *= 2 }},
    };

    // Mapeo de Emojis
    const itemEmojis = {
        'cesto': '🧺', 'ardilla': '🐿️', 'arbol': '🌳', 'viento': '💨',
        'guantes': '🧤', 'rastrillo': '🪒', 'soplador': '🌬️',
        'nidos': '🏡', 'rastrillo_titanio': '✨',
        'vientos_huracanados': '🌪️', 'guantes_dorados': '🧤✨', 'otono_eterno': '👑',
        'cesta_misteriosa': '🎁'
    };
    
    // Slots de Escenario
    const scenerySlotMap = {
        'cesto': ['slot-cesto-1', 'slot-cesto-2', 'slot-cesto-3', 'slot-cesto-4', 'slot-cesto-5'],
        'ardilla': ['slot-ardilla-1', 'slot-ardilla-2', 'slot-ardilla-3', 'slot-ardilla-4'],
        'arbol': ['slot-arbol-1', 'slot-arbol-2', 'slot-arbol-3']
    };

    // Definición de Mejoras
    let upgrades = [
        { id: 'cesto', name: 'Cesto de Hojas', pluralName: 'Cestos de Hojas', baseCost: 10, type: 'hps', value: 0.1, count: 0 },
        { id: 'ardilla', name: 'Ardilla Ayudante', pluralName: 'Ardillas Ayudantes', baseCost: 100, type: 'hps', value: 1, count: 0 },
        { id: 'arbol', name: 'Árbol Pequeño', pluralName: 'Árboles Pequeños', baseCost: 1100, type: 'hps', value: 8, count: 0 },
        { id: 'viento', name: 'Viento de Otoño', pluralName: 'Vientos de Otoño', baseCost: 12000, type: 'hps', value: 47, count: 0 },
        { id: 'guantes', name: 'Guantes de Jardín', pluralName: 'Guantes de Jardín', baseCost: 50, type: 'click', value: 1, count: 0 },
        { id: 'rastrillo', name: 'Rastrillo', pluralName: 'Rastrillos', baseCost: 500, type: 'click', value: 5, count: 0 },
        { id: 'soplador', name: 'Soplador de Hojas', pluralName: 'Sopladores de Hojas', baseCost: 8000, type: 'click', value: 25, count: 0 },
        { id: 'nidos', name: 'Nidos Acogedores', pluralName: 'Nidos Acogedores', baseCost: 10000, type: 'multiplier', value: 2, target: 'ardilla', count: 0, unlocked: false, requirement: { id: 'ardilla', count: 25 }},
        { id: 'rastrillo_titanio', name: 'Rastrillo de Titanio', pluralName: 'Rastrillos de Titanio', baseCost: 50000, type: 'multiplier', value: 3, target: 'rastrillo', count: 0, unlocked: false, requirement: { id: 'rastrillo', count: 10 }},
        { id: 'vientos_huracanados', name: 'Vientos Huracanados', pluralName: 'Vientos Huracanados', baseCost: 50000000, type: 'multiplier', value: 3, target: 'viento', count: 0, unlocked: false, requirement: { id: 'viento', count: 25 }},
        { id: 'guantes_dorados', name: 'Guantes Dorados', pluralName: 'Guantes Dorados', baseCost: 75000000, type: 'multiplier', value: 5, target: 'soplador', count: 0, unlocked: false, requirement: { id: 'soplador', count: 25 }},
        { id: 'otono_eterno', name: 'Otoño Eterno', pluralName: 'Otoños Eternos', baseCost: 1000000000, type: 'multiplier', value: 5, target: 'arbol', count: 0, unlocked: false, requirement: { id: 'arbol', count: 50 }},
        { id: 'cesta_misteriosa', name: 'Cesta Misteriosa', pluralName: 'Cestas Misteriosas', baseCost: 10000, type: 'consumable', value: 0, count: 0, unlocked: true }
    ];
    
    // Mejoras de Prestigio
    let prestigeUpgrades = [
        { id: 'perm_multi_1', name: 'Hojas Ancestrales', desc: 'Todas las hojas (HPS y HPC) valen +1% por nivel.', baseCost: 1, count: 0, maxLevel: -1 },
        { id: 'perm_golden_1', name: 'Suerte del Bosque', desc: 'Las Hojas Doradas aparecen un 2% más rápido por nivel.', baseCost: 2, count: 0, maxLevel: 25 }, // 50% max
        { id: 'perm_start_1', name: 'Rastrillo de Confianza', desc: 'Empiezas cada partida con 5 Rastrillos.', baseCost: 5, count: 0, maxLevel: 1 },
    ];


    // --- 3. FUNCIONES DE LÓGICA DEL JUEGO ---

// --- REEMPLAZA esta función ---
    function getUpgradeCost(upgrade, n) {
        // --- MODIFICADO: Coste de la Cesta Misteriosa ---
        if (upgrade.type === 'consumable') {
            // El coste ahora es 10 minutos de HPS + 10,000 base
            // Esto evita que se pueda "spamear"
            return Math.floor(leavesPerSecond * 600) + 10000;
        }
        
        // Lógica de coste normal (sin cambios)
        const baseCost = upgrade.baseCost;
        const count = upgrade.count;
        const rate = 1.15;
        if (n === 1) {
            return Math.floor(baseCost * Math.pow(rate, count));
        }
        const cost = baseCost * (Math.pow(rate, count) * (Math.pow(rate, n) - 1)) / (rate - 1);
        return Math.floor(cost);
    }
    
    function calculateMaxBuy(upgrade) {
        if (upgrade.type === 'consumable') return 1;

        const baseCost = upgrade.baseCost;
        const count = upgrade.count;
        const rate = 1.15;
        let availableLeaves = leaves;
        const costToNext = baseCost * Math.pow(rate, count);
        if (availableLeaves < costToNext) return 0;
        const n = Math.floor(Math.log( (availableLeaves * (rate - 1)) / (costToNext) + 1 ) / Math.log(rate));
        return n;
    }

    function buyUpgrade(upgradeIndex) {
        const upgrade = upgrades[upgradeIndex];
        
        if (upgrade.type === 'consumable') {
            const cost = getUpgradeCost(upgrade, 1);
            if (leaves >= cost) {
                leaves -= cost;
                playAudio(buySound);
                openMysteryChest();
                renderStore();
            }
            return;
        }

        const buyAmount = buyAmountModes[currentBuyModeIndex];
        let amountToBuy = 0;
        let totalCost = 0;

        if (buyAmount === 'max') {
            amountToBuy = calculateMaxBuy(upgrade);
            if (amountToBuy === 0) {
                amountToBuy = 1;
                totalCost = getUpgradeCost(upgrade, 1);
            } else {
                totalCost = getUpgradeCost(upgrade, amountToBuy);
            }
        } else {
            amountToBuy = buyAmount;
            totalCost = getUpgradeCost(upgrade, amountToBuy);
        }

        if (leaves >= totalCost && amountToBuy > 0) {
            leaves -= totalCost;
            
            if (scenerySlotMap[upgrade.id]) {
                for (let i = 0; i < amountToBuy; i++) {
                    const itemIndex = upgrade.count + i;
                    addSceneryItem(upgrade.id, itemIndex);
                }
            }
            
            if (upgrade.type === 'multiplier') {
                upgrade.count = 1;
            } else {
                upgrade.count += amountToBuy;
            }

            recalculateHPS();
            recalculateHPC();

            checkUnlockConditions(upgrade.id, upgrade.count);
            
            renderStore();
            updateUI();
            playAudio(buySound);
            showNotification(`¡Mejora Comprada!`, `${upgrade.name}`, itemEmojis[upgrade.id] || '✔️');
        }
    }

    function checkUnlockConditions() {
        let storeNeedsRender = false;
        upgrades.forEach(up => {
            if (up.unlocked === false && up.requirement) {
                const reqUpgrade = upgrades.find(u => u.id === up.requirement.id);
                if (reqUpgrade && reqUpgrade.count >= up.requirement.count) {
                    up.unlocked = true;
                    storeNeedsRender = true;
                }
            }
        });
        
        if (storeNeedsRender) {
            renderStore();
        }
    }

    function recalculateHPS() {
        let totalHPS = 0;
        let hpsGroups = {};
        
        upgrades.filter(u => u.type === 'hps').forEach(u => {
            let itemHPS = u.value * u.count;
            if (achievementMultipliers[u.id]) {
                itemHPS *= achievementMultipliers[u.id];
            }
            hpsGroups[u.id] = itemHPS;
        });

        upgrades.filter(u => u.type === 'multiplier' && u.count > 0).forEach(mult => {
            if (hpsGroups[mult.target]) {
                hpsGroups[mult.target] *= mult.value;
            }
        });

        for (const id in hpsGroups) {
            totalHPS += hpsGroups[id];
        }
        
        const bellotaBonus = 1 + (bellotas * 0.01) + (prestigeUpgrades.find(p => p.id === 'perm_multi_1')?.count || 0) * 0.01;
        const weatherBonus = (currentWeatherEvent && (currentWeatherEvent.target === 'hps' || currentWeatherEvent.target === 'all')) ? currentWeatherEvent.multiplier : 1;
        
        leavesPerSecond = totalHPS * globalMultiplier * bellotaBonus * weatherBonus;
    }

    function recalculateHPC() {
        let totalHPC = baseClickValue;
        let hpcGroups = {};
        
        upgrades.filter(u => u.type === 'click').forEach(u => {
            let itemHPC = u.value * u.count;
            if (achievementMultipliers[u.id]) {
                itemHPC *= achievementMultipliers[u.id];
            }
            hpcGroups[u.id] = itemHPC;
        });

        upgrades.filter(u => u.type === 'multiplier' && u.count > 0).forEach(mult => {
            if (hpcGroups[mult.target]) {
                hpcGroups[mult.target] *= mult.value;
            }
        });
        
        for (const id in hpcGroups) {
            totalHPC += hpcGroups[id];
        }
        
        const bellotaBonus = 1 + (bellotas * 0.01) + (prestigeUpgrades.find(p => p.id === 'perm_multi_1')?.count || 0) * 0.01;
        const weatherBonus = (currentWeatherEvent && (currentWeatherEvent.target === 'click' || currentWeatherEvent.target === 'all')) ? currentWeatherEvent.multiplier : 1;
        
        leavesPerClick = totalHPC * globalMultiplier * bellotaBonus * weatherBonus;
    }

    function clickLeaf() {
        totalClicks++;
        
        let clickValue = leavesPerClick;
        
        if (Date.now() < boostEndTime) {
            clickValue *= clickFrenzyMultiplier;
        }
        
        const leavesGained = clickValue;
        leaves += leavesGained;
        totalLeavesCollected += leavesGained;
        totalLeavesPrestige += leavesGained;
        
        updateUI();
        playAudio(clickSound);
        clickerButton.classList.add('popping');
        setTimeout(() => clickerButton.classList.remove('popping'), 200);
        showFloatingNumber(clickValue, clickerButton);
    }

    function gameLoop() {
        const leavesGained = leavesPerSecond;
        leaves += leavesGained;
        totalLeavesCollected += leavesGained;
        totalLeavesPrestige += leavesGained;
        
        updateUI();

        if (buyAmountModes[currentBuyModeIndex] === 'max') {
            updateStoreMaxMode();
        } else {
            updateStoreAvailability();
        }

        checkAchievements();
        updateBoostTimer();
        updatePrestigePanel();
        
        if (currentWeatherEvent && Date.now() > eventEndTime) {
            endWeatherEvent();
        }

        if (isMusicEnabled && music.paused && !document.hidden) {
            music.play().catch(e => console.warn("Interacción de usuario necesaria para música."));
        }
    }

    // --- 4. FUNCIONES DE RENDERIZADO Y UI ---
    
    function updateUI() {
        leafCountDisplay.textContent = Math.floor(leaves).toLocaleString('es');
        hpsCountDisplay.textContent = leavesPerSecond.toFixed(1).toLocaleString('es');
        hpcCountDisplay.textContent = Math.floor(leavesPerClick).toLocaleString('es');
        bellotaCountDisplay.textContent = bellotas.toLocaleString('es');
    }

    function renderStore() {
        storeContainer.innerHTML = '';
        const buyAmount = buyAmountModes[currentBuyModeIndex];
        const typeOrder = { 'hps': 1, 'click': 2, 'multiplier': 3, 'consumable': 4 };
        let currentType = null;
        const cozyTitles = {
            'hps': '🍂 Producción Pasiva',
            'click': '👆 Mejoras de Clic',
            'multiplier': '✨ Multiplicadores Raros',
            'consumable': '🎁 Objetos Especiales'
        };

        const sortedUpgrades = [...upgrades].sort((a, b) => {
            if (a.unlocked === false && b.unlocked !== false) return 1;
            if (a.unlocked !== false && b.unlocked === false) return -1;
            const orderA = typeOrder[a.type] || 99;
            const orderB = typeOrder[b.type] || 99;
            if (orderA !== orderB) return orderA - orderB;
            return a.baseCost - b.baseCost;
        });

        sortedUpgrades.forEach(upgrade => {
            const originalIndex = upgrades.findIndex(u => u.id === upgrade.id);
            
            if (upgrade.unlocked === false) {
                if (currentType !== 'locked') {
                    currentType = 'locked';
                    const header = document.createElement('h3');
                    header.className = 'store-header locked';
                    header.textContent = '🔒 Mejoras Bloqueadas';
                    storeContainer.appendChild(header);
                }
            } else if (upgrade.type !== currentType) {
                currentType = upgrade.type;
                const header = document.createElement('h3');
                header.className = 'store-header';
                header.textContent = cozyTitles[currentType] || 'Varios';
                storeContainer.appendChild(header);
            }

            if (upgrade.unlocked === false) {
                const reqUpgrade = upgrades.find(u => u.id === upgrade.requirement.id);
                const reqName = reqUpgrade ? reqUpgrade.pluralName : (upgrade.requirement.id + 's');
                const item = document.createElement('div');
                item.className = 'upgrade-item locked';
                item.innerHTML = `
                    <span class="upgrade-icon">🔒</span>
                    <div class="upgrade-info">
                        <strong>${upgrade.name}</strong>
                        <div class="details">
                            Bloqueado: Se necesitan ${upgrade.requirement.count} ${reqName}
                        </div>
                    </div>
                    <button class="buy-button" disabled>Bloqueado</button>
                `;
                storeContainer.appendChild(item);
                return;
            }

            if (upgrade.type === 'consumable') {
                const costToDisplay = getUpgradeCost(upgrade, 1);
                const item = document.createElement('div');
                item.className = 'upgrade-item';
                item.dataset.type = upgrade.type;
                item.innerHTML = `
                    <span class="upgrade-icon">${itemEmojis[upgrade.id] || ''}</span>
                    <div class="upgrade-info">
                        <strong>${upgrade.name}</strong>
                        <div class="details">
                            <span class="upgrade-cost">Coste: ${costToDisplay.toLocaleString('es')}</span> | 
                            <span class="upgrade-stat">¡Prueba tu suerte!</span>
                        </div>
                    </div>
                    <button class="buy-button" id="buy-${upgrade.id}" data-cost="${costToDisplay}">Comprar 1</button>
                `;
                item.querySelector('.buy-button').addEventListener('click', () => buyUpgrade(originalIndex));
                storeContainer.appendChild(item);
                return;
            }

            let amountToDisplay = 0;
            let costToDisplay = 0;
            let buyText = 'Comprar';
            if (buyAmount === 'max') {
                amountToDisplay = calculateMaxBuy(upgrade);
                if (amountToDisplay > 0) {
                    costToDisplay = getUpgradeCost(upgrade, amountToDisplay);
                    buyText = `Comprar ${amountToDisplay}`;
                } else {
                    amountToDisplay = 1; costToDisplay = getUpgradeCost(upgrade, 1); buyText = 'Comprar';
                }
            } else {
                amountToDisplay = buyAmount; costToDisplay = getUpgradeCost(upgrade, amountToDisplay); buyText = 'Comprar';
            }
            
            const isDisabled = (upgrade.type === 'multiplier' && upgrade.count > 0);
            const detailText = upgrade.type === 'hps' ? `HPS: +${upgrade.value}` : (upgrade.type === 'click' ? `Clic: +${upgrade.value}` : `Multiplica ${upgrade.target} x${upgrade.value}`);
            const emojiIcon = itemEmojis[upgrade.id] || '';

            const item = document.createElement('div');
            item.className = 'upgrade-item';
            item.dataset.type = upgrade.type;
            item.innerHTML = `
                ${emojiIcon ? `<span class="upgrade-icon">${emojiIcon}</span>` : ''}
                <div class="upgrade-info">
                    <strong>${upgrade.name}</strong>
                    <div class="details">
                        <span class="upgrade-cost">${isDisabled ? 'Comprado' : 'Coste: ' + costToDisplay.toLocaleString('es')}</span> | 
                        <span class="upgrade-stat">${detailText}</span> | 
                        <span class="upgrade-count">Tienes: ${upgrade.count}</span>
                    </div>
                </div>
                <button class="buy-button" id="buy-${upgrade.id}" data-cost="${costToDisplay}" ${isDisabled ? 'disabled' : ''}>
                    ${isDisabled ? 'Comprado' : buyText}
                </button>
            `;
            item.querySelector('.buy-button').addEventListener('click', () => buyUpgrade(originalIndex));
            storeContainer.appendChild(item);
        });
        
        updateStoreAvailability();
    }

    function updateStoreAvailability() {
        document.querySelectorAll('.buy-button').forEach(button => {
            if (button.textContent.trim() === 'Comprado') return;
            const cost = parseInt(button.dataset.cost, 10);
            button.disabled = leaves < cost;
        });
    }

    function updateStoreMaxMode() {
        upgrades.forEach(upgrade => {
            const buttonElement = document.getElementById(`buy-${upgrade.id}`);
            if (!buttonElement || (upgrade.type === 'multiplier' && upgrade.count > 0) || upgrade.unlocked === false || upgrade.type === 'consumable') return;
            
            const itemElement = buttonElement.closest('.upgrade-item');
            const costElement = itemElement.querySelector('.upgrade-cost');
            let amountToDisplay = calculateMaxBuy(upgrade);
            let costToDisplay = 0;
            let buyText = 'Comprar';
            if (amountToDisplay > 0) {
                costToDisplay = getUpgradeCost(upgrade, amountToDisplay);
                buyText = `Comprar ${amountToDisplay}`;
            } else {
                costToDisplay = getUpgradeCost(upgrade, 1);
                buyText = 'Comprar';
            }
            costElement.textContent = `Coste: ${costToDisplay.toLocaleString('es')}`;
            buttonElement.textContent = buyText;
            buttonElement.dataset.cost = costToDisplay;
            buttonElement.disabled = leaves < costToDisplay;
        });
    }

    function setupBuyAmountToggle() {
        buyAmountToggleBtn.addEventListener('click', () => {
            currentBuyModeIndex = (currentBuyModeIndex + 1) % buyAmountModes.length;
            const newMode = buyAmountModes[currentBuyModeIndex];
            buyAmountToggleBtn.textContent = `Comprar: ${newMode === 'max' ? 'Max' : newMode}`;
            buyAmountToggleBtn.dataset.amount = newMode;
            renderStore();
        });
    }

    function showFloatingNumber(amount, originElement) {
        const number = document.createElement('span');
        number.textContent = `+${Math.floor(amount)}`;
        number.classList.add('floating-number');
        const rect = originElement.getBoundingClientRect();
        const clickerRect = clickerArea.getBoundingClientRect();
        number.style.left = `${rect.left - clickerRect.left + (rect.width / 2) - 30}px`;
        number.style.top = `${rect.top - clickerRect.top + (rect.height / 2) - 30}px`;
        clickerArea.appendChild(number);
        number.addEventListener('animationend', () => number.remove());
    }

    function showNotification(title, message, icon = '🔔', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const notification = document.createElement('div');
        notification.className = 'cozy-notification';
        notification.innerHTML = `
            <div class="cozy-notification-icon">${icon}</div>
            <div class="cozy-notification-body">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;
        const slideOutTime = duration - 500;
        notification.style.animation = `slideIn 0.5s ease-out forwards, slideOut 0.5s ease-in ${slideOutTime}ms forwards`;
        setTimeout(() => {
            notification.remove();
        }, duration);
        notification.addEventListener('click', () => {
            notification.remove();
        });
        container.appendChild(notification);
    }

    // --- 5. FUNCIONES DE GUARDADO Y CARGA ---

    function saveGame() {
        const gameState = {
            leaves: leaves,
            totalLeavesCollected: totalLeavesCollected,
            totalClicks: totalClicks,
            totalGoldenLeavesClicked: totalGoldenLeavesClicked,
            totalLeavesPrestige: totalLeavesPrestige,
            upgrades: upgrades.map(u => ({ id: u.id, count: u.count, unlocked: u.unlocked })),
            isMusicEnabled: isMusicEnabled,
            isSfxEnabled: isSfxEnabled,
            lastSaveTime: Date.now(),
            globalMultiplier: globalMultiplier,
            boostEndTime: boostEndTime,
            achievements: Object.keys(achievements).reduce((acc, key) => {
                acc[key] = { unlocked: achievements[key].unlocked };
                return acc;
            }, {}),
            achievementMultipliers: achievementMultipliers,
            goldenLeafSpawnTime: goldenLeafSpawnTime,
            goldenLeafRewardMultiplier: goldenLeafRewardMultiplier,
            goldenLeafDuration: goldenLeafDuration,
            baseClickValue: baseClickValue,
            clickFrenzyMultiplier: clickFrenzyMultiplier,
            bellotas: bellotas,
            prestigeUpgrades: prestigeUpgrades.map(p => ({ id: p.id, count: p.count }))
        };
        localStorage.setItem('cozyClickerSave', JSON.stringify(gameState));
    }

    function loadGame() {
        const savedData = localStorage.getItem('cozyClickerSave');
        if (savedData) {
            const loadedState = JSON.parse(savedData);
            
            leaves = loadedState.leaves || 0;
            totalLeavesCollected = loadedState.totalLeavesCollected || leaves;
            totalClicks = loadedState.totalClicks || 0;
            totalGoldenLeavesClicked = loadedState.totalGoldenLeavesClicked || 0;
            totalLeavesPrestige = loadedState.totalLeavesPrestige || 0;
            
            isMusicEnabled = loadedState.isMusicEnabled !== false;
            isSfxEnabled = loadedState.isSfxEnabled !== false;
            globalMultiplier = loadedState.globalMultiplier || 1;
            boostEndTime = loadedState.boostEndTime || 0;
            
            achievementMultipliers = loadedState.achievementMultipliers || achievementMultipliers;
            goldenLeafSpawnTime = loadedState.goldenLeafSpawnTime || 40;
            goldenLeafRewardMultiplier = loadedState.goldenLeafRewardMultiplier || 1;
            goldenLeafDuration = loadedState.goldenLeafDuration || 10;
            baseClickValue = loadedState.baseClickValue || 1;
            clickFrenzyMultiplier = loadedState.clickFrenzyMultiplier || 7;

            bellotas = loadedState.bellotas || 0;
            if (loadedState.prestigeUpgrades) {
                loadedState.prestigeUpgrades.forEach(savedPU => {
                    const puInGame = prestigeUpgrades.find(p => p.id === savedPU.id);
                    if (puInGame) puInGame.count = savedPU.count || 0;
                });
            }

            if (loadedState.achievements) {
                for (const key in achievements) {
                    if (loadedState.achievements[key]) {
                        achievements[key].unlocked = loadedState.achievements[key].unlocked;
                    }
                }
            }

            if (loadedState.upgrades) {
                loadedState.upgrades.forEach(savedUpgrade => {
                    const upgradeInGame = upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgradeInGame) {
                        upgradeInGame.count = savedUpgrade.count || 0;
                        if (savedUpgrade.unlocked !== undefined) {
                            upgradeInGame.unlocked = savedUpgrade.unlocked;
                        }
                    }
                });
            }

            if (loadedState.lastSaveTime) {
                const now = Date.now();
                let offlineSeconds = (now - loadedState.lastSaveTime) / 1000;
                const maxOfflineSeconds = 8 * 60 * 60;
                offlineSeconds = Math.min(offlineSeconds, maxOfflineSeconds);
                
                recalculateHPS();
                
                let offlineLeaves = Math.floor(offlineSeconds * leavesPerSecond);
                if (offlineLeaves > 0) {
                    leaves += offlineLeaves;
                    totalLeavesCollected += offlineLeaves;
                    totalLeavesPrestige += offlineLeaves;
                    showNotification(`¡Bienvenido de nuevo!`, `Ganaste ${offlineLeaves.toLocaleString('es')} hojas.`, '🍂');
                }
            }
        }
        
        recalculateHPS();
        recalculateHPC();
        updateAudioButtonsUI();
        populateSceneryFromLoad();
        renderAchievements();
        renderPrestigePanel();
        
        checkUnlockConditions();
        checkAchievements();
    }

    // --- 6. FUNCIONES DE AUDIO, FONDO Y NUEVAS CARACTERÍSTICAS ---
    
    function playAudio(audioElement, volume = 1) {
        if (!isSfxEnabled) return;
        audioElement.currentTime = 0;
        audioElement.volume = volume;
        audioElement.play();
    }

    function addSceneryItem(upgradeId, itemIndex, fromLoad = false) {
        const slots = scenerySlotMap[upgradeId];
        if (!slots || itemIndex >= slots.length) return;
        const slotId = slots[itemIndex];
        const slotElement = document.getElementById(slotId);
        
        if (slotElement && !slotElement.classList.contains('occupied')) {
            slotElement.textContent = itemEmojis[upgradeId];
            slotElement.style.setProperty('--i', itemIndex);
            
            slotElement.classList.add('occupied');
        }
    }

    function populateSceneryFromLoad() {
        sceneryDisplay.querySelectorAll('.scenery-slot').forEach(slot => {
            slot.textContent = '';
            slot.classList.remove('occupied');
            slot.style.opacity = '0';
            slot.style.transform = 'scale(0.5)';
        });
        upgrades.forEach(upgrade => {
            if (scenerySlotMap[upgrade.id]) {
                for (let i = 0; i < upgrade.count; i++) {
                    addSceneryItem(upgrade.id, i, true); 
                }
            }
        });
        
        setTimeout(() => {
            sceneryDisplay.querySelectorAll('.scenery-slot').forEach(slot => {
                if (slot.textContent) {
                    slot.classList.add('occupied');
                }
            });
        }, 10);
    }

    function setupAudioControls() {
        musicToggleBtn.addEventListener('click', () => {
            isMusicEnabled = !isMusicEnabled;
            updateAudioButtonsUI();
            if (isMusicEnabled) {
                music.volume = 0.3;
                music.play();
            } else {
                music.pause();
            }
            saveGame();
        });
        sfxToggleBtn.addEventListener('click', () => {
            isSfxEnabled = !isSfxEnabled;
            updateAudioButtonsUI();
            saveGame();
        });
    }

    function updateAudioButtonsUI() {
        if (isMusicEnabled) {
            musicToggleBtn.textContent = 'Música: 🎵';
            musicToggleBtn.classList.remove('off');
        } else {
            musicToggleBtn.textContent = 'Música: 🔇';
            musicToggleBtn.classList.add('off');
        }
        if (isSfxEnabled) {
            sfxToggleBtn.textContent = 'Sonidos: 🔊';
            sfxToggleBtn.classList.remove('off');
        } else {
            sfxToggleBtn.textContent = 'Sonidos: 🔇';
            sfxToggleBtn.classList.add('off');
        }
    }

    function setupFallingLeavesAnimation() {
        const container = document.getElementById('falling-leaves-container');
        if (!container) return;
        
        const numberOfLeaves = 35;
        for (let i = 0; i < numberOfLeaves; i++) {
            const leaf = document.createElement('span');
            leaf.className = 'falling-leaf';
            leaf.textContent = '🍂';
            leaf.style.left = `${Math.random() * 100}%`;
            
            const baseDuration = Math.random() * 5 + 10;
            leaf.style.setProperty('--base-leaf-fall-duration', `${baseDuration}s`);
            
            leaf.style.animationDuration = `var(--base-leaf-fall-duration)`;
            
            leaf.style.animationDelay = `${Math.random() * 15}s`;
            leaf.style.fontSize = `${Math.random() * 0.5 + 1}rem`;
            container.appendChild(leaf);
        }
    }
    
    function setupRain() {
        if (!rainContainer) return;
        rainContainer.innerHTML = ''; 
        for (let i = 0; i < 100; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${Math.random() * 0.5 + 0.3}s`; 
            drop.style.animationDelay = `${Math.random() * 2}s`;
            rainContainer.appendChild(drop);
        }
    }

// *** NUEVO: Función para crear hojas de viento ***
    function setupWind() {
        if (!windContainer) return;
        windContainer.innerHTML = '';
        for (let i = 0; i < 50; i++) { // 50 ráfagas
            const leaf = document.createElement('div');
            leaf.className = 'wind-leaf';
            leaf.textContent = '🍂';
            
            // --- ¡ESTO ES LO IMPORTANTE! ---
            // Usamos la variable '--start-y' para definir la POSICIÓN X (horizontal) aleatoria.
            leaf.style.setProperty('--start-y', `${Math.random() * 100}vw`); // Posición X: 0% a 100% del ancho

            // Duración de la caída
            leaf.style.animationDuration = `${Math.random() * 3.5 + 1.5}s`; // 2-4 segundos
            // Delay para que no salgan todas a la vez
            leaf.style.animationDelay = `${Math.random() * 3}s`; // 0-3 segundos
            windContainer.appendChild(leaf);
        }
    }

    // Lógica de Pestañas
    function setupTabs() {
        const tabs = [tabStore, tabAchievements, tabPrestige];
        const panels = [storePanel, achievementsPanel, prestigePanel];

        tabs.forEach((tab, index) => {
            if (!tab) return;
            tab.addEventListener('click', () => {
                tabs.forEach(t => t?.classList.remove('active'));
                panels.forEach(p => p?.classList.add('hidden'));
                
                tab.classList.add('active');
                if (panels[index]) {
                    panels[index].classList.remove('hidden');
                }
            });
        });
    }

    // Lógica de Logros
    function renderAchievements() {
        achievementsContainer.innerHTML = '';
        Object.keys(achievements).forEach(key => {
            const ach = achievements[key];
            const item = document.createElement('div');
            item.className = 'achievement-item';
            if (ach.unlocked) {
                item.classList.add('unlocked');
            }
            item.innerHTML = `
                <span class="achievement-icon">${ach.unlocked ? ach.icon : '❓'}</span>
                <div class="achievement-info">
                    <strong>${ach.unlocked ? ach.name : 'Logro Oculto'}</strong>
                    <div class="desc">${ach.unlocked ? ach.desc : 'Sigue jugando para desbloquear.'}</div>
                    <div class="reward">Recompensa: ${ach.reward.text}</div>
                </div>
            `;
            achievementsContainer.appendChild(item);
        });
    }

    function checkAchievements() {
        let needsRender = false;
        let needsRecalc = false;
        for (const key in achievements) {
            const ach = achievements[key];
            if (!ach.unlocked && ach.condition()) {
                ach.unlocked = true;
                if (ach.reward.effect) {
                    ach.reward.effect();
                    needsRecalc = true;
                }
                showNotification(`¡Logro Desbloqueado!`, `${ach.name}`, ach.icon);
                needsRender = true;
            }
        }
        if (needsRender) renderAchievements();
        if (needsRecalc) {
            recalculateHPS();
            recalculateHPC();
        }
    }

    // Lógica de Hoja Dorada
    function spawnGoldenLeaf() {
        const leaf = document.createElement('div');
        leaf.className = 'golden-leaf';
        leaf.textContent = '🍂';
        
        const startX = Math.random() * 80 + 10;
        const sway = (Math.random() - 0.5) * 2;
        leaf.style.setProperty('--start-x', `${startX}%`);
        leaf.style.setProperty('--sway', sway);
        
        leaf.addEventListener('click', clickGoldenLeaf, { once: true });
        
        clickerSection.appendChild(leaf);
        
        setTimeout(() => {
            leaf.remove();
        }, goldenLeafDuration * 1000);
    }

    function clickGoldenLeaf(event) {
        event.target.remove();
        playAudio(buySound);
        totalGoldenLeavesClicked++;

        if (Math.random() < 0.7) {
            const hpsReward = Math.floor(leavesPerSecond * 300 * goldenLeafRewardMultiplier);
            const clickReward = Math.floor(leavesPerClick * 100 * goldenLeafRewardMultiplier);
            const minReward = 25;
            const reward = Math.max(hpsReward, clickReward, minReward);
            
            leaves += reward;
            totalLeavesCollected += reward;
            totalLeavesPrestige += reward;
            showNotification('¡Hoja Dorada!', `+${reward.toLocaleString('es')} hojas`, '✨');
            showFloatingNumber(reward, event.target);
        } else {
            boostEndTime = Date.now() + 15000;
            showNotification('¡Frenesí de Clics!', `¡Tus clics valen x${clickFrenzyMultiplier} por 15s!`, '⚡');
        }
        updateUI();
    }
    
    function goldenLeafLoop() {
        const randomFactor = (Math.random() * 0.5) + 0.5;
        const time = (randomFactor * goldenLeafSpawnTime) * 1000;
        
        setTimeout(() => {
            spawnGoldenLeaf();
            goldenLeafLoop();
        }, time);
    }
    
    function updateBoostTimer() {
        if (Date.now() < boostEndTime) {
            const timeLeft = ((boostEndTime - Date.now()) / 1000).toFixed(0);
            boostTimerDisplay.textContent = `¡Frenesí x${clickFrenzyMultiplier}! ${timeLeft}s`;
            boostTimerDisplay.classList.remove('hidden');
        } else {
            boostTimerDisplay.classList.add('hidden');
        }
    }
    
    function openMysteryChest() {
        const roll = Math.random();
        
        if (roll < 0.50) { // 50% - Nada
            showNotification("¡Vaya!", "La cesta estaba vacía...", '💨');
        
        } else if (roll < 0.75) { // 25% - Hojas (1 min de HPS)
            const reward = Math.floor(leavesPerSecond * 60 * goldenLeafRewardMultiplier);
            leaves += reward; totalLeavesCollected += reward; totalLeavesPrestige += reward;
            showNotification("¡Algo es algo!", `¡La cesta contenía ${reward.toLocaleString('es')} hojas!`, '💰');
        
        } else if (roll < 0.90) { // 15% - Hojas (20 mins de HPS)
            const reward = Math.floor(leavesPerSecond * 1200 * goldenLeafRewardMultiplier);
            leaves += reward; totalLeavesCollected += reward; totalLeavesPrestige += reward;
            showNotification("¡Premio!", `¡La cesta contenía ${reward.toLocaleString('es')} hojas!`, '💰');
        
        } else if (roll < 0.95) { // 5% - Frenesí (15s)
            boostEndTime = Date.now() + 15000; // 15 segundos
            showNotification("¡Frenesí!", `¡Clics x${clickFrenzyMultiplier} por 15 segundos!`, '⚡');
        
        } else { // 5% - 1 Bellota (solo si ya has hecho prestigio)
            if (bellotas > 0 || totalLeavesPrestige >= PRESTIGE_REQ) {
                bellotas++;
                showNotification("¡Increíble!", `¡Has encontrado 1 Bellota Dorada! 🌰`, '🌰');
            } else {
                showNotification("¡Vaya!", "La cesta estaba vacía...", '💨'); // Falla si no puedes ganar bellotas
            }
        }
        updateUI();
    }

    function weatherEventLoop() {
        const time = (Math.random() * 45 + 45) * 1000; 
        //const time = 5 * 1000;
        setTimeout(() => {
            startWeatherEvent();
        }, time);
    }

function startWeatherEvent() {
        if (currentWeatherEvent) return;

        const event = weatherEvents[Math.floor(Math.random() * weatherEvents.length)];
        currentWeatherEvent = event;
        eventEndTime = Date.now() + (event.duration * 1000);
        
        weatherEventBar.textContent = `${event.name}: ${event.text}`;
        weatherEventBar.className = event.id;

        // --- Lógica para mostrar efectos ---
        if (event.id === 'rain') {
            rainContainer.classList.remove('hidden');
        } else if (event.id === 'sun') {
            sunOverlay.classList.remove('hidden');
        } else if (event.id === 'wind') {
            // Muestra el contenedor de hojas de viento
            windContainer.classList.remove('hidden');
        }

        recalculateHPS();
        recalculateHPC();
        
        setTimeout(endWeatherEvent, event.duration * 1000);
    }
    
    function endWeatherEvent() {
        // --- Lógica para ocultar TODO ---
        rainContainer.classList.add('hidden');
        sunOverlay.classList.add('hidden');
        windContainer.classList.add('hidden'); // Oculta el viento
        
        currentWeatherEvent = null; 
        weatherEventBar.classList.add('hidden');

        recalculateHPS();
        recalculateHPC();
        
        weatherEventLoop();
    }    
    // Lógica de Prestigio
    function calculateBellotasToGain() {
        return Math.floor(Math.pow(totalLeavesPrestige / 1e9, 1/3) * 10);
    }
    
    function updatePrestigePanel() {
        if (!prestigePanel.classList.contains('hidden')) {
            const bellotasToGain = calculateBellotasToGain();
            prestigeTotalLeavesDisplay.textContent = Math.floor(totalLeavesPrestige).toLocaleString('es');
            prestigeGainDisplay.textContent = `${bellotasToGain.toLocaleString('es')} 🌰`;
            
            if (totalLeavesPrestige >= PRESTIGE_REQ) {
                prestigeResetButton.disabled = false;
            } else {
                prestigeResetButton.disabled = true;
            }

            document.querySelectorAll('.prestige-buy').forEach(button => {
                const index = parseInt(button.dataset.index, 10);
                if (isNaN(index)) return; 

                const pu = prestigeUpgrades[index];
                if (!pu) return; 

                const cost = pu.baseCost + pu.count;
                const isTooExpensive = bellotas < cost;
                const isMaxLevel = (pu.maxLevel !== -1 && pu.count >= pu.maxLevel);
                
                button.disabled = (isTooExpensive || isMaxLevel);
            });
        }
    }
        
    function renderPrestigePanel() {
        prestigeUpgradeContainer.innerHTML = '<h3>Mejoras Permanentes</h3>';
        
        prestigeUpgrades.forEach((pu, index) => {
            const cost = pu.baseCost + pu.count;

            const isMaxLevel = (pu.maxLevel !== -1 && pu.count >= pu.maxLevel);
            const isTooExpensive = bellotas < cost;
            const maxLevelText = isMaxLevel ? '(Max)' : '';
        
            const item = document.createElement('div');
            item.className = 'prestige-upgrade';

            const info = document.createElement('div');
            info.className = 'upgrade-info';
            info.innerHTML = `
                <strong>${pu.name} ${maxLevelText}</strong>
                <div class="details">${pu.desc} (Nivel ${pu.count})</div>
                <div class="details bellota">Coste: ${cost} 🌰</div>
            `;

            const button = document.createElement('button');
            button.className = 'buy-button prestige-buy';
            button.textContent = 'Comprar';
            button.dataset.index = index;
            
            if (isMaxLevel) {
                button.textContent = 'Comprado';
            } else {
                button.textContent = 'Comprar';
            }

            button.disabled = (isTooExpensive || isMaxLevel);
            
            item.appendChild(info);
            item.appendChild(button);
            prestigeUpgradeContainer.appendChild(item);
        });

        document.querySelectorAll('.prestige-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                buyPrestigeUpgrade(index);
            });
        });
    }

    function buyPrestigeUpgrade(index) {
        const pu = prestigeUpgrades[index];
        const cost = pu.baseCost + pu.count;
        
        if (bellotas >= cost && (pu.maxLevel === -1 || pu.count < pu.maxLevel)) {
            bellotas -= cost;
            pu.count++;
            
            if (pu.id === 'perm_golden_1') goldenLeafSpawnTime *= 0.98;

            if (pu.id === 'perm_start_1') {
                const rakeUpgrade = upgrades.find(u => u.id === 'rastrillo');
                if (rakeUpgrade) {
                    if (rakeUpgrade.count < 5) {
                        rakeUpgrade.count = 5;
                    }
                    renderStore(); 
                }
            }
            
            recalculateHPS();
            recalculateHPC();
            updateUI();
            renderPrestigePanel(); 
            saveGame();
        }
    }
        
    function prestigeReset() {
        const bellotasGanadas = calculateBellotasToGain();
        if (totalLeavesPrestige < PRESTIGE_REQ) return;
        
        if (!confirm(`¿Estás seguro? Reiniciarás tu progreso (hojas y mejoras) y ganarás ${bellotasGanadas} 🌰 Bellotas Doradas.`)) {
            return;
        }

        playAudio(buySound, 0.5);
        
        const bellotasActuales = bellotas + bellotasGanadas;
        const totalClicksActuales = totalClicks; 
        const totalGoldenLeavesActuales = totalGoldenLeavesClicked; 
        const totalLeavesCollectedActuales = totalLeavesCollected; 
        
        const achMultipliers = achievementMultipliers;
        const gLeafSpawn = goldenLeafSpawnTime;
        const gLeafReward = goldenLeafRewardMultiplier;
        const baseClick = baseClickValue;
        const clickFrenzyMult = clickFrenzyMultiplier;
        const gMultiplier = globalMultiplier;

        leaves = 0;
        totalLeavesPrestige = 0;
        boostEndTime = 0;
        currentWeatherEvent = null;
        
        upgrades.forEach(u => {
            u.count = 0;
            if (u.requirement) {
                u.unlocked = false;
            }
        });

        bellotas = bellotasActuales;
        totalClicks = totalClicksActuales;
        totalGoldenLeavesClicked = totalGoldenLeavesActuales;
        totalLeavesCollected = totalLeavesCollectedActuales;
        
        achievementMultipliers = achMultipliers;
        goldenLeafSpawnTime = gLeafSpawn;
        goldenLeafRewardMultiplier = gLeafReward;
        baseClickValue = baseClick;
        clickFrenzyMultiplier = clickFrenzyMult;
        globalMultiplier = gMultiplier;

        const startRakes = prestigeUpgrades.find(p => p.id === 'perm_start_1')?.count || 0;
        if (startRakes > 0) {
            const rakeUpgrade = upgrades.find(u => u.id === 'rastrillo');
            if (rakeUpgrade) rakeUpgrade.count = 5;
        }
        
        recalculateHPS();
        recalculateHPC();
        updateUI();
        renderStore();
        renderPrestigePanel(); 
        populateSceneryFromLoad(); 

        saveGame();
        location.reload();
    }

    // --- 7. INICIALIZACIÓN ---
    function init() {
        clickerButton.addEventListener('click', clickLeaf);
        setupAudioControls();
        setupBuyAmountToggle();
        setupTabs();
        prestigeResetButton.addEventListener('click', prestigeReset);
        
        loadGame();
        
        renderStore();
        updateUI();

        setupFallingLeavesAnimation(); 
        setupRain(); 
        setupWind(); // *** NUEVO: Pre-genera las hojas de viento ***

        // Iniciar bucles principales
        setInterval(gameLoop, 1000);
        setInterval(saveGame, 10000);
        window.addEventListener('beforeunload', saveGame);
        
        goldenLeafLoop();
        weatherEventLoop();
    }

    init();
});