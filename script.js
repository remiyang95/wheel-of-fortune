document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const wheelCanvas = document.getElementById('wheelCanvas');
    const ctx = wheelCanvas.getContext('2d');
    const optionInput = document.getElementById('optionInput');
    const addBtn = document.getElementById('addBtn');
    const spinBtn = document.getElementById('spinBtn');
    const clearBtn = document.getElementById('clearBtn');
    const optionsList = document.getElementById('optionsList');
    
    // State
    let options = [];
    let isSpinning = false;
    let currentRotation = 0;
    
    // Initialize canvas size
    function initCanvas() {
        const size = Math.min(window.innerWidth * 0.9, 500);
        wheelCanvas.width = size;
        wheelCanvas.height = size;
        drawWheel();
    }
    
    // Draw the wheel
    function drawWheel() {
        if (options.length === 0) return;
        
        const centerX = wheelCanvas.width / 2;
        const centerY = wheelCanvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Clear any existing tooltips
        const existingTooltip = document.querySelector('.wheel-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        
        // Draw segments
        const segmentAngle = (2 * Math.PI) / options.length;
        
        options.forEach((option, index) => {
            // Calculate angles
            const startAngle = index * segmentAngle + currentRotation;
            const endAngle = (index + 1) * segmentAngle + currentRotation;
            
            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            // Alternate colors for better visibility
            ctx.fillStyle = index % 2 === 0 ? 
                `hsl(${(index * 360 / options.length)}, 70%, 70%)` : 
                `hsl(${(index * 360 / options.length)}, 70%, 60%)`;
            ctx.fill();
            
            // Add text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            
            // Text settings
            ctx.fillStyle = '#2c3e50';
            ctx.font = `bold ${Math.max(12, Math.min(16, radius / 10))}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            // Draw text along the arc
            const text = option.length > 10 ? option.substring(0, 8) + '...' : option;
            ctx.fillText(text, radius * 0.4, 0);
            
            ctx.restore();
        });
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();
    }
    
    // Add option to the list
    function addOption() {
        const option = optionInput.value.trim();
        if (option && !options.includes(option)) {
            options.push(option);
            optionInput.value = '';
            updateOptionsList();
            drawWheel();
        } else if (options.includes(option)) {
            alert('This option already exists!');
        }
        optionInput.focus();
    }
    
    // Update the options list in the UI
    function updateOptionsList() {
        optionsList.innerHTML = '';
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-tag';
            optionElement.innerHTML = `
                ${option}
                <button class="remove-option" data-index="${index}">&times;</button>
            `;
            optionsList.appendChild(optionElement);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                options.splice(index, 1);
                updateOptionsList();
                drawWheel();
            });
        });
    }
    
    // Spin the wheel
    function spinWheel() {
        if (options.length < 2) {
            alert('Please add at least 2 options to spin the wheel!');
            return;
        }
        
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;
        
        // Random rotation (5-10 full rotations + random segment)
        const spinAngle = 1800 + Math.floor(Math.random() * 1800);
        const segmentAngle = 360 / options.length;
        const targetSegment = Math.floor(Math.random() * options.length);
        const targetAngle = (spinAngle + (targetSegment * segmentAngle)) * (Math.PI / 180);
        
        // Animation
        const startTime = performance.now();
        const duration = 4000; // 4 seconds
        const startRotation = currentRotation;
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            // Calculate new rotation with easing
            currentRotation = startRotation + (targetAngle * easeOutQuart);
            
            // Redraw wheel with new rotation
            drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete
                isSpinning = false;
                spinBtn.disabled = false;
                
                // No notification needed - user can see where the wheel landed
                // Simply re-enable the spin button
                spinBtn.disabled = false;
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Clear all options
    function clearAll() {
        if (confirm('Are you sure you want to clear all options?')) {
            options = [];
            currentRotation = 0;
            updateOptionsList();
            // Clear the canvas and redraw to show empty state
            const ctx = wheelCanvas.getContext('2d');
            ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
            // Redraw the wheel (which will be empty)
            drawWheel();
        }
    }
    
    // Event Listeners
    addBtn.addEventListener('click', addOption);
    optionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addOption();
    });
    
    spinBtn.addEventListener('click', spinWheel);
    clearBtn.addEventListener('click', clearAll);
    
    // Handle mouse move for tooltips
    wheelCanvas.addEventListener('mousemove', (e) => {
        if (options.length === 0) return;
        
        const rect = wheelCanvas.getBoundingClientRect();
        const centerX = wheelCanvas.width / 2;
        const centerY = wheelCanvas.height / 2;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate angle and distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = Math.min(centerX, centerY) - 10;
        
        // Only show tooltip if mouse is over the wheel
        if (distance < radius) {
            let angle = Math.atan2(dy, dx) - currentRotation;
            while (angle < 0) angle += Math.PI * 2;
            
            const segmentAngle = (2 * Math.PI) / options.length;
            const segmentIndex = Math.floor(angle / segmentAngle) % options.length;
            
            // Show tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'wheel-tooltip';
            tooltip.textContent = options[segmentIndex];
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY - 25}px`;
            
            // Remove any existing tooltip
            const existingTooltip = document.querySelector('.wheel-tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }
            
            document.body.appendChild(tooltip);
        } else {
            // Remove tooltip if not over wheel
            const tooltip = document.querySelector('.wheel-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        }
    });
    
    // Remove tooltip when mouse leaves canvas
    wheelCanvas.addEventListener('mouseleave', () => {
        const tooltip = document.querySelector('.wheel-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        initCanvas();
    });
    
    // Initialize
    initCanvas();
});
