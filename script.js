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

    // Pestañas y Logros
    const tabStore = document.getElementById('tab-store');
    const tabAchievements = document.getElementById('tab-achievements');
    const storePanel = document.getElementById('store-panel');
    const achievementsPanel = document.getElementById('achievements-panel');
    const achievementsContainer = document.getElementById('achievements-container');
    const boostTimerDisplay = document.getElementById('boost-timer');

    // --- 2. ESTADO DEL JUEGO ---
    let leaves = 0;
    let leavesPerSecond = 0;
    let leavesPerClick = 1;
    let baseClickValue = 1; // Valor base de click antes de multiplicadores
    let lastSaveTime = Date.now();
    
    // Estado de Audio y Compra
    let isMusicEnabled = true;
    let isSfxEnabled = true;
    const buyAmountModes = [1, 10, 'max'];
    let currentBuyModeIndex = 0;

    // Boosts, Multiplicadores y Logros
    let globalMultiplier = 1;
    let boostEndTime = 0;
    let clickFrenzyMultiplier = 7;
    
    // --- NUEVAS ESTADÍSTICAS GLOBALES ---
    let totalLeavesCollected = 0;
    let totalClicks = 0;
    let totalGoldenLeavesClicked = 0;

    // --- NUEVAS VARIABLES DE JUEGO ---
    let goldenLeafSpawnTime = 40; // Tiempo base de aparición (segundos)
    let goldenLeafRewardMultiplier = 1; // Multiplicador de recompensa
    let goldenLeafDuration = 10; // Duración en pantalla

    // --- NUEVO: Objeto para multiplicadores de logros ---
    let achievementMultipliers = {
        cesto: 1,
        ardilla: 1,
        arbol: 1,
        viento: 1,
        guantes: 1,
        rastrillo: 1,
        soplador: 1
    };

const achievements = {
        // Logros de Hojas
        'leaf_10k': { 
            name: 'Bolsillo Lleno', 
            desc: 'Recoge un total de 10,000 hojas.', 
            icon: '💰', 
            unlocked: false, 
            condition: () => totalLeavesCollected >= 10000,
            reward: { text: '+1% de HPS y HPC global', effect: () => globalMultiplier *= 1.01 }
        },
        'leaf_1M': { 
            name: 'Millonario de Hojas', 
            desc: 'Recoge un total de 1,000,000 hojas.', 
            icon: '🤑', 
            unlocked: false, 
            condition: () => totalLeavesCollected >= 1000000,
            reward: { text: '+2% de HPS y HPC global', effect: () => globalMultiplier *= 1.02 }
        },
        'leaf_1B': { 
            name: 'Magnate de Hojas', 
            desc: 'Recoge un total de 1 Billón de hojas.', 
            icon: '👑', 
            unlocked: false, 
            condition: () => totalLeavesCollected >= 1000000000,
            reward: { text: '+10% de HPS y HPC global', effect: () => globalMultiplier *= 1.10 }
        },
        // Logros de Clicks
        'click_100': { 
            name: 'Dedo Ágil', 
            desc: 'Haz clic 100 veces.', 
            icon: '👆',
            unlocked: false, 
            condition: () => totalClicks >= 100,
            reward: { text: '+1 al valor base de Clic', effect: () => baseClickValue++ }
        },
        'click_1000': { 
            name: 'Dedo Dorado', 
            desc: 'Haz clic 1,000 veces.', 
            icon: '👉',
            unlocked: false, 
            condition: () => totalClicks >= 1000,
            reward: { text: '+10 al valor base de Clic', effect: () => baseClickValue += 10 }
        },
        'click_100k': { 
            name: 'Cliclista Olímpico', 
            desc: 'Haz clic 100,000 veces.', 
            icon: '🥇',
            unlocked: false, 
            condition: () => totalClicks >= 100000,
            reward: { text: '+100 al valor base de Clic', effect: () => baseClickValue += 100 }
        },
        // Logros de HPS
        'hps_100': { 
            name: 'Piloto Automático', 
            desc: 'Alcanza 100 Hojas por Segundo (HPS).', 
            icon: '⏱️', 
            unlocked: false, 
            condition: () => leavesPerSecond >= 100,
            reward: { text: '+2% de HPS y HPC global', effect: () => globalMultiplier *= 1.02 }
        },
        'hps_1k': { 
            name: 'Velocidad de Escape', 
            desc: 'Alcanza 1,000 Hojas por Segundo (HPS).', 
            icon: '🚀', 
            unlocked: false, 
            condition: () => leavesPerSecond >= 1000,
            reward: { text: 'El Frenesí de Clicks ahora es x10 (en lugar de x7)', effect: () => clickFrenzyMultiplier = 10 }
        },
        // Logros de Mejoras
        'cesto_50': { 
            name: 'Maestro de Cestos', 
            desc: 'Compra 50 Cestos de Hojas.', 
            icon: '🧺', 
            unlocked: false, 
            condition: () => (upgrades.find(u => u.id === 'cesto')?.count || 0) >= 50,
            reward: { text: 'Los Cestos son un 100% más efectivos (x2)', effect: () => achievementMultipliers.cesto *= 2 }
        },
        'ardilla_50': { 
            name: 'Líder de la Manada', 
            desc: 'Compra 50 Ardillas Ayudantes.', 
            icon: '🐿️', 
            unlocked: false, 
            condition: () => (upgrades.find(u => u.id === 'ardilla')?.count || 0) >= 50,
            reward: { text: 'Las Ardillas son un 100% más efectivas (x2)', effect: () => achievementMultipliers.ardilla *= 2 }
        },
        'arbol_50': { 
            name: 'Bosque Creciente', 
            desc: 'Compra 50 Árboles Pequeños.', 
            icon: '🌳', 
            unlocked: false, 
            condition: () => (upgrades.find(u => u.id === 'arbol')?.count || 0) >= 50,
            reward: { text: 'Los Árboles son un 100% más efectivos (x2)', effect: () => achievementMultipliers.arbol *= 2 }
        },
        // Logros de Hoja Dorada
        'golden_1': { 
            name: '¡Qué Suerte!', 
            desc: 'Haz clic en tu primera Hoja Dorada.', 
            icon: '✨', 
            unlocked: false, 
            condition: () => totalGoldenLeavesClicked >= 1,
            reward: { text: 'Las Hojas Doradas aparecen un 10% más rápido', effect: () => goldenLeafSpawnTime *= 0.9 }
        },
        'golden_10': { 
            name: 'Cazador de Oro', 
            desc: 'Haz clic en 10 Hojas Doradas.', 
            icon: '🌟', 
            unlocked: false, 
            condition: () => totalGoldenLeavesClicked >= 10,
            reward: { text: 'Las recompensas de Hojas Doradas se duplican (x2)', effect: () => goldenLeafRewardMultiplier *= 2 }
        },
    };


// --- AÑADE esto a tu objeto itemEmojis ---
    const itemEmojis = {
        'cesto': '🧺', 'ardilla': '🐿️', 'arbol': '🌳', 'viento': '💨',
        'guantes': '🧤', 'rastrillo': '🪒', 'soplador': '🌬️',
        'nidos': '🏡', 'rastrillo_titanio': '✨',
        // --- NUEVOS ---
        'vientos_huracanados': '🌪️',
        'guantes_dorados': '🧤✨',
        'otono_eterno': '👑'
    };
    const scenerySlotMap = {
        'cesto': ['slot-cesto-1', 'slot-cesto-2', 'slot-cesto-3', 'slot-cesto-4', 'slot-cesto-5'],
        'ardilla': ['slot-ardilla-1', 'slot-ardilla-2', 'slot-ardilla-3', 'slot-ardilla-4'],
        'arbol': ['slot-arbol-1', 'slot-arbol-2', 'slot-arbol-3']
    };

  // --- REEMPLAZA tu array 'upgrades' por este ---
    let upgrades = [
        // HPS
        { id: 'cesto', name: 'Cesto de Hojas', pluralName: 'Cestos de Hojas', baseCost: 10, type: 'hps', value: 0.1, count: 0 },
        { id: 'ardilla', name: 'Ardilla Ayudante', pluralName: 'Ardillas Ayudantes', baseCost: 100, type: 'hps', value: 1, count: 0 },
        { id: 'arbol', name: 'Árbol Pequeño', pluralName: 'Árboles Pequeños', baseCost: 1100, type: 'hps', value: 8, count: 0 },
        { id: 'viento', name: 'Viento de Otoño', pluralName: 'Vientos de Otoño', baseCost: 12000, type: 'hps', value: 47, count: 0 },
        
        // Clic
        { id: 'guantes', name: 'Guantes de Jardín', pluralName: 'Guantes de Jardín', baseCost: 50, type: 'click', value: 1, count: 0 },
        { id: 'rastrillo', name: 'Rastrillo', pluralName: 'Rastrillos', baseCost: 500, type: 'click', value: 5, count: 0 },
        { id: 'soplador', name: 'Soplador de Hojas', pluralName: 'Sopladores de Hojas', baseCost: 8000, type: 'click', value: 25, count: 0 },

        // Multiplicadores
        { 
            id: 'nidos', 
            name: 'Nidos Acogedores', pluralName: 'Nidos Acogedores', 
            baseCost: 10000, type: 'multiplier', value: 2,
            target: 'ardilla', count: 0, unlocked: false,
            requirement: { id: 'ardilla', count: 25 }
        },
        { 
            id: 'rastrillo_titanio', 
            name: 'Rastrillo de Titanio', pluralName: 'Rastrillos de Titanio', 
            baseCost: 50000, type: 'multiplier', value: 3,
            target: 'rastrillo', count: 0, unlocked: false,
            requirement: { id: 'rastrillo', count: 10 }
        },
        { 
            id: 'vientos_huracanados', 
            name: 'Vientos Huracanados', pluralName: 'Vientos Huracanados',
            baseCost: 50000000, type: 'multiplier', value: 3,
            target: 'viento', count: 0, unlocked: false,
            requirement: { id: 'viento', count: 25 }
        },
        { 
            id: 'guantes_dorados', 
            name: 'Guantes Dorados', pluralName: 'Guantes Dorados',
            baseCost: 75000000, type: 'multiplier', value: 5,
            target: 'soplador', count: 0, unlocked: false,
            requirement: { id: 'soplador', count: 25 }
        },
        { 
            id: 'otono_eterno', 
            name: 'Otoño Eterno', pluralName: 'Otoños Eternos',
            baseCost: 1000000000, type: 'multiplier', value: 5,
            target: 'arbol', count: 0, unlocked: false,
            requirement: { id: 'arbol', count: 50 }
        },
    ];

    // --- 3. FUNCIONES DE LÓGICA DEL JUEGO ---

    function getUpgradeCost(upgrade, n) {
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
            // --- MODIFICADO: Usar notificación cozy ---
            showNotification(
                `¡Mejora Comprada!`, 
                `${upgrade.name}`, 
                itemEmojis[upgrade.id] || '✔️'
            );
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
                    // No notificar si es carga de juego
                }
            }
        });
        
        if (storeNeedsRender) {
            renderStore();
        }
    }

 // --- REEMPLAZA esta función ---
    function recalculateHPS() {
        let totalHPS = 0;
        let hpsGroups = {};
        
        // 1. Base HPS
        upgrades.filter(u => u.type === 'hps').forEach(u => {
            let itemHPS = u.value * u.count;
            
            // 2. Aplicar multiplicadores de logros
            if (achievementMultipliers[u.id]) {
                itemHPS *= achievementMultipliers[u.id];
            }
            
            hpsGroups[u.id] = itemHPS;
        });

        // 3. Aplicar multiplicadores de mejoras
        upgrades.filter(u => u.type === 'multiplier' && u.count > 0).forEach(mult => {
            if (hpsGroups[mult.target]) {
                hpsGroups[mult.target] *= mult.value;
            }
        });

        // 4. Sumar y aplicar multiplicador global
        for (const id in hpsGroups) {
            totalHPS += hpsGroups[id];
        }
        
        leavesPerSecond = totalHPS * globalMultiplier;
    }

    // --- REEMPLAZA esta función ---
    function recalculateHPC() {
        let totalHPC = baseClickValue; // Empezar con el valor base
        let hpcGroups = {};
        
        // 1. Base HPC
        upgrades.filter(u => u.type === 'click').forEach(u => {
            let itemHPC = u.value * u.count;
            // 2. Aplicar multiplicadores de logros
            if (achievementMultipliers[u.id]) {
                itemHPC *= achievementMultipliers[u.id];
            }
            hpcGroups[u.id] = itemHPC;
        });

        // 3. Aplicar multiplicadores de mejoras
        upgrades.filter(u => u.type === 'multiplier' && u.count > 0).forEach(mult => {
            if (hpcGroups[mult.target]) {
                hpcGroups[mult.target] *= mult.value;
            }
        });
        
        // 4. Sumar
        for (const id in hpcGroups) {
            totalHPC += hpcGroups[id];
        }
        
        // 5. Aplicar multiplicador global
        leavesPerClick = totalHPC * globalMultiplier;
    }

    // click en Hoja
    function clickLeaf() {
        totalClicks++; // Contar click
        
        let clickValue = leavesPerClick;
        
        if (Date.now() < boostEndTime) {
            clickValue *= clickFrenzyMultiplier;
        }
        
        leaves += clickValue;
        totalLeavesCollected += clickValue; // Contar hojas
        
        updateUI();
        playAudio(clickSound);
        clickerButton.classList.add('popping');
        setTimeout(() => clickerButton.classList.remove('popping'), 200);
        showFloatingNumber(clickValue, clickerButton);
    }

    // Bucle Principal
    function gameLoop() {
        leaves += leavesPerSecond;
        totalLeavesCollected += leavesPerSecond; // Contar hojas
        updateUI();

        if (buyAmountModes[currentBuyModeIndex] === 'max') {
            updateStoreMaxMode();
        } else {
            updateStoreAvailability();
        }

        checkAchievements();
        updateBoostTimer();

        if (isMusicEnabled && music.paused && !document.hidden) {
            music.play().catch(e => console.warn("Interacción de usuario necesaria para música."));
        }
    }

    // --- 4. FUNCIONES DE RENDERIZADO Y UI ---
    
    function updateUI() {
        leafCountDisplay.textContent = Math.floor(leaves).toLocaleString('es');
        hpsCountDisplay.textContent = leavesPerSecond.toFixed(1).toLocaleString('es');
        hpcCountDisplay.textContent = Math.floor(leavesPerClick).toLocaleString('es');
    }

// --- REEMPLAZA esta función ---
    function renderStore() {
        storeContainer.innerHTML = '';
        const buyAmount = buyAmountModes[currentBuyModeIndex];

        // --- NUEVO: Títulos para las categorías ---
        const cozyTitles = {
            'hps': '🍂 Producción Pasiva',
            'click': '👆 Mejoras de click',
            'multiplier': '✨ Multiplicadores Raros'
        };
        
        // Rastreador para saber cuándo insertar un título
        let currentType = null;

        // Lógica de ordenación (sin cambios)
        const typeOrder = { 'hps': 1, 'click': 2, 'multiplier': 3 };
        const sortedUpgrades = [...upgrades].sort((a, b) => {
            if (a.unlocked === false && b.unlocked !== false) return 1;
            if (a.unlocked !== false && b.unlocked === false) return -1;
            const orderA = typeOrder[a.type] || 99;
            const orderB = typeOrder[b.type] || 99;
            if (orderA !== orderB) return orderA - orderB;
            return a.baseCost - b.baseCost;
        });

        // Iterar sobre el array ORDENADO
        sortedUpgrades.forEach(upgrade => {
            const originalIndex = upgrades.findIndex(u => u.id === upgrade.id);
            
            // --- INICIO DE LA LÓGICA DE CABECERA ---
            // Comprobar si necesitamos insertar un nuevo título
            if (upgrade.unlocked === false) {
                // Si es un item bloqueado
                if (currentType !== 'locked') {
                    currentType = 'locked'; // Marcar que hemos entrado a la sección bloqueada
                    const header = document.createElement('h3');
                    header.className = 'store-header locked';
                    header.textContent = '🔒 Mejoras Bloqueadas';
                    storeContainer.appendChild(header);
                }
            } else if (upgrade.type !== currentType) {
                // Si es un item desbloqueado de un NUEVO tipo
                currentType = upgrade.type; // Actualizar el tipo actual
                const header = document.createElement('h3');
                header.className = 'store-header';
                header.textContent = cozyTitles[currentType] || 'Varios';
                storeContainer.appendChild(header);
            }
            // --- FIN DE LA LÓGICA DE CABECERA ---


            // --- Renderizado del item (lógica sin cambios) ---
            
            // Si está bloqueado
            if (upgrade.unlocked === false) {
                // --- NUEVO: Encontrar el nombre plural del requisito ---
                const reqUpgrade = upgrades.find(u => u.id === upgrade.requirement.id);
                const reqName = reqUpgrade ? reqUpgrade.pluralName : (upgrade.requirement.id + 's'); // Usar pluralName

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
                return; // Saltar al siguiente
            }

            // Lógica de renderizado para items desbloqueados
            let amountToDisplay = 0;
            let costToDisplay = 0;
            let buyText = 'Comprar';

            if (buyAmount === 'max') {
                amountToDisplay = calculateMaxBuy(upgrade);
                if (amountToDisplay > 0) {
                    costToDisplay = getUpgradeCost(upgrade, amountToDisplay);
                    buyText = `Comprar ${amountToDisplay}`;
                } else {
                    amountToDisplay = 1;
                    costToDisplay = getUpgradeCost(upgrade, 1);
                    buyText = 'Comprar';
                }
            } else {
                amountToDisplay = buyAmount;
                costToDisplay = getUpgradeCost(upgrade, amountToDisplay);
                buyText = 'Comprar';
            }
            
            const isDisabled = (upgrade.type === 'multiplier' && upgrade.count > 0);
            const detailText = upgrade.type === 'hps' ? `HPS: +${upgrade.value}` : 
                              (upgrade.type === 'click' ? `click: +${upgrade.value}` : 
                              `Multiplica ${upgrade.target} x${upgrade.value}`);
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

            item.querySelector('.buy-button').addEventListener('click', () => {
                buyUpgrade(originalIndex);
            });
            storeContainer.appendChild(item);
        });
        
        updateStoreAvailability();
    }

// --- REEMPLAZA esta función ---
    function updateStoreAvailability() {
        document.querySelectorAll('.buy-button').forEach(button => {
            // Si el botón ya dice 'Comprado', no lo toques.
            if (button.textContent.trim() === 'Comprado') {
                return; 
            }
            
            // Para todos los demás botones, actualiza su estado basado en el coste.
            const cost = parseInt(button.dataset.cost, 10);
            button.disabled = leaves < cost;
        });
    }

    function updateStoreMaxMode() {
        upgrades.forEach(upgrade => {
            const buttonElement = document.getElementById(`buy-${upgrade.id}`);
            if (!buttonElement || (upgrade.type === 'multiplier' && upgrade.count > 0) || upgrade.unlocked === false) return;
            
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

    // --- REEMPLAZA esta función ---
    function showNotification(title, message, icon = '🔔', duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return; // Salir si el contenedor no existe

        const notification = document.createElement('div');
        notification.className = 'cozy-notification';

        notification.innerHTML = `
            <div class="cozy-notification-icon">${icon}</div>
            <div class="cozy-notification-body">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;

        // Añadir animación de salida y eliminación
        const slideOutTime = duration - 500; // 500ms para la anim de salida
        notification.style.animation = `slideIn 0.5s ease-out forwards, slideOut 0.5s ease-in ${slideOutTime}ms forwards`;

        // Eliminar del DOM después de que termine la animación
        setTimeout(() => {
            notification.remove();
        }, duration);

        // Hacer click para cerrar
        notification.addEventListener('click', () => {
            notification.remove();
        });

        container.appendChild(notification);
    }

    // --- 5. FUNCIONES DE GUARDADO Y CARGA ---

   // --- REEMPLAZA esta función ---
    function saveGame() {
        const gameState = {
            leaves: leaves,
            totalLeavesCollected: totalLeavesCollected, // Guardar
            totalClicks: totalClicks, // Guardar
            totalGoldenLeavesClicked: totalGoldenLeavesClicked, // Guardar
            upgrades: upgrades.map(u => ({ id: u.id, count: u.count, unlocked: u.unlocked })),
            isMusicEnabled: isMusicEnabled,
            isSfxEnabled: isSfxEnabled,
            lastSaveTime: Date.now(),
            globalMultiplier: globalMultiplier,
            boostEndTime: boostEndTime,
            // Guardar estado de logros y variables de sistema
            achievements: Object.keys(achievements).reduce((acc, key) => {
                acc[key] = { unlocked: achievements[key].unlocked };
                return acc;
            }, {}),
            achievementMultipliers: achievementMultipliers,
            goldenLeafSpawnTime: goldenLeafSpawnTime,
            goldenLeafRewardMultiplier: goldenLeafRewardMultiplier,
            goldenLeafDuration: goldenLeafDuration,
            baseClickValue: baseClickValue,
            clickFrenzyMultiplier: clickFrenzyMultiplier // Guardar
        };
        localStorage.setItem('cozyClickerSave', JSON.stringify(gameState));
    }

    // --- REEMPLAZA esta función ---
    function loadGame() {
        const savedData = localStorage.getItem('cozyClickerSave');
        if (savedData) {
            const loadedState = JSON.parse(savedData);
            
            leaves = loadedState.leaves || 0;
            totalLeavesCollected = loadedState.totalLeavesCollected || leaves;
            totalClicks = loadedState.totalClicks || 0;
            totalGoldenLeavesClicked = loadedState.totalGoldenLeavesClicked || 0;
            
            isMusicEnabled = loadedState.isMusicEnabled !== false;
            isSfxEnabled = loadedState.isSfxEnabled !== false;
            globalMultiplier = loadedState.globalMultiplier || 1;
            boostEndTime = loadedState.boostEndTime || 0;
            
            // Cargar variables de sistema
            achievementMultipliers = loadedState.achievementMultipliers || achievementMultipliers;
            goldenLeafSpawnTime = loadedState.goldenLeafSpawnTime || goldenLeafSpawnTime;
            goldenLeafRewardMultiplier = loadedState.goldenLeafRewardMultiplier || goldenLeafRewardMultiplier;
            goldenLeafDuration = loadedState.goldenLeafDuration || goldenLeafDuration;
            baseClickValue = loadedState.baseClickValue || 1; // Cargar
            clickFrenzyMultiplier = loadedState.clickFrenzyMultiplier || 7; // Cargar

            if (loadedState.achievements) {
                for (const key in achievements) {
                    if (loadedState.achievements[key]) {
                        achievements[key].unlocked = loadedState.achievements[key].unlocked;
                    }
                }
            }

            if (loadedState.upgrades) {
                loadedState.upgrades.forEach(savedUpgrade => {
                    // Buscar en el array 'upgrades' del juego
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
                    showNotification(`¡Bienvenido de nuevo!`, `Ganaste ${offlineLeaves.toLocaleString('es')} hojas.`, '🍂');
                }
            }
        }
        
        // Recalcular todo y renderizar
        recalculateHPS();
        recalculateHPC();
        updateAudioButtonsUI();
        populateSceneryFromLoad();
        renderAchievements();
        
        // Comprobar desbloqueos y logros retroactivamente
        checkUnlockConditions();
        checkAchievements();
    }
    // --- 6. FUNCIONES DE AUDIO, FONDO Y NUEVAS CARACTERÍSTICAS ---
    
    function playAudio(audioElement) {
        if (!isSfxEnabled) return;
        audioElement.currentTime = 0;
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
            if (fromLoad) {
                slotElement.style.opacity = '1';
                slotElement.style.transform = 'scale(1)';
            }
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
            leaf.style.animationDuration = `${Math.random() * 5 + 10}s`;
            leaf.style.animationDelay = `${Math.random() * 15}s`;
            leaf.style.fontSize = `${Math.random() * 0.5 + 1}rem`;
            container.appendChild(leaf);
        }
    }

    // Lógica de Pestañas
    function setupTabs() {
        tabStore.addEventListener('click', () => {
            tabStore.classList.add('active');
            tabAchievements.classList.remove('active');
            storePanel.classList.add('active');
            storePanel.classList.remove('hidden');
            achievementsPanel.classList.add('hidden');
            achievementsPanel.classList.remove('active');
        });
        tabAchievements.addEventListener('click', () => {
            tabStore.classList.remove('active');
            tabAchievements.classList.add('active');
            storePanel.classList.add('hidden');
            storePanel.classList.remove('active');
            achievementsPanel.classList.add('active');
            achievementsPanel.classList.remove('hidden');
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
                showNotification(`¡Logro Desbloqueado: ${ach.name}!`, 
                    ach.icon);
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
        }, goldenLeafDuration * 1000); // Usar variable
    }

// --- REEMPLAZA esta función ---
    function clickGoldenLeaf(event) {
        event.target.remove();
        playAudio(buySound);
        totalGoldenLeavesClicked++; // Contar

        if (Math.random() < 0.7) {
            // Recompensa 1: Hojas instantáneas
            // --- CORREGIDO: Lógica de recompensa mejorada ---
            const hpsReward = Math.floor(leavesPerSecond * 300 * goldenLeafRewardMultiplier);
            const clickReward = Math.floor(leavesPerClick * 100 * goldenLeafRewardMultiplier); // Valor de 100 clics
            const minReward = 25; // Un mínimo de 25 hojas

            // La recompensa es el valor MÁS ALTO de los tres
            const reward = Math.max(hpsReward, clickReward, minReward);
            
            leaves += reward;
            totalLeavesCollected += reward;
            showNotification(
                '¡Hoja Dorada!', 
                `+${reward.toLocaleString('es')} hojas`, 
                '✨'
            );
            showFloatingNumber(reward, event.target);
        } else {
            // Recompensa 2: Frenesí de Clics
            boostEndTime = Date.now() + 15000;
            showNotification(
                '¡Frenesí de Clics!', 
                `¡Tus clics valen x${clickFrenzyMultiplier} por 15s!`, 
                '⚡'
            );
        }
        updateUI();
    }
    
    function goldenLeafLoop() {
        // --- CORREGIDO: Temporizador más rápido ---
        // Genera un tiempo entre el 50% y el 100% del tiempo base
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

    // --- 7. INICIALIZACIÓN ---
    function init() {
        clickerButton.addEventListener('click', clickLeaf);
        setupAudioControls();
        setupBuyAmountToggle();
        setupTabs();
        
        loadGame();
        
        renderStore();
        updateUI();

        setupFallingLeavesAnimation(); 

        // Iniciar bucles principales
        setInterval(gameLoop, 1000);
        setInterval(saveGame, 10000);
        window.addEventListener('beforeunload', saveGame);
        
        goldenLeafLoop();
    }

    init();
});