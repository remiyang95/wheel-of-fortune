document.addEventListener('DOMContentLoaded', () => {
    // Hide Clear All link by default
    const clearLink = document.getElementById('clearBtn');
    if (clearLink) {
        clearLink.style.display = 'none';
    }
    // Custom Modal Implementation
    class CustomModal {
        constructor() {
            this.modal = document.getElementById('customModal');
            this.title = document.getElementById('modalTitle');
            this.message = document.getElementById('modalMessage');
            this.input = document.getElementById('modalInput');
            this.inputContainer = document.getElementById('modalInputContainer');
            this.confirmBtn = document.getElementById('modalConfirm');
            this.cancelBtn = document.getElementById('modalCancel');
            this.closeBtn = document.getElementById('closeModal');
            
            // Set up event listeners
            this.confirmBtn.addEventListener('click', () => this.hide(true));
            this.cancelBtn.addEventListener('click', () => this.hide(false));
            this.closeBtn.addEventListener('click', () => this.hide(false));
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.hide(false);
            });
            
            // Store the current resolve function
            this.resolvePromise = null;
        }
        
        show(options = {}) {
            const { 
                title = 'Alert', 
                message = '', 
                showInput = false, 
                inputValue = '',
                confirmText = 'OK',
                cancelText = 'Cancel',
                showCancel = true,
                confirmButtonClass = '',
                cancelButtonClass = ''
            } = options;
            
            this.title.textContent = title;
            this.title.style.display = title ? 'block' : 'none';
            this.message.textContent = message;
            this.inputContainer.style.display = showInput ? 'block' : 'none';
            this.input.value = inputValue;
            this.confirmBtn.textContent = confirmText;
            if (confirmButtonClass) {
                this.confirmBtn.className = 'modal-btn modal-btn-confirm ' + confirmButtonClass;
            } else {
                this.confirmBtn.className = 'modal-btn modal-btn-confirm';
            }
            
            if (cancelButtonClass) {
                this.cancelBtn.className = 'modal-btn modal-btn-cancel ' + cancelButtonClass;
            } else {
                this.cancelBtn.className = 'modal-btn modal-btn-cancel';
            }
            this.cancelBtn.textContent = cancelText;
            this.cancelBtn.style.display = showCancel ? 'block' : 'none';
            
            if (confirmButtonClass) {
                this.confirmBtn.classList.add(confirmButtonClass);
            }
            
            // Show the modal
            this.modal.classList.add('show');
            
            // Focus the input if shown, otherwise focus the confirm button
            if (showInput) {
                this.input.focus();
            } else {
                this.confirmBtn.focus();
            }
            
            // Return a promise that resolves with the result
            return new Promise((resolve) => {
                this.resolvePromise = resolve;
            });
        }
        
        hide(result) {
            this.modal.classList.remove('show');
            if (this.resolvePromise) {
                if (this.inputContainer.style.display === 'block') {
                    this.resolvePromise(result ? this.input.value : null);
                } else {
                    this.resolvePromise(result);
                }
                this.resolvePromise = null;
            }
        }
    }

    // Create a global modal instance
    const modal = new CustomModal();

    // Replace browser dialogs
    window.alert = (message) => {
        return modal.show({
            title: 'Alert',
            message,
            showCancel: false
        });
    };

    window.confirm = (message) => {
        return modal.show({
            title: 'Confirm',
            message,
            showCancel: true
        });
    };

    window.prompt = (message, defaultValue = '') => {
        return modal.show({
            title: 'Prompt',
            message,
            showInput: true,
            inputValue: defaultValue,
            showCancel: true
        });
    };

    // DOM Elements
    const wheelCanvas = document.getElementById('wheelCanvas');
    const ctx = wheelCanvas.getContext('2d');
    const optionInput = document.getElementById('optionInput');
    const addBtn = document.getElementById('addBtn');
    const spinBtn = document.getElementById('spinBtn');
    const clearBtn = document.getElementById('clearBtn');
    const optionsList = document.getElementById('optionsList');
    const saveWheelBtn = document.getElementById('saveWheelBtn');
    const wheelNameInput = document.getElementById('wheelName');
    const savedWheelsList = document.getElementById('savedWheelsList');
    
    // Reference to the wheels collection in Firestore
    const wheelsRef = db.collection('wheels');
    
    // State
    let options = [];
    let isSpinning = false;
    let currentRotation = 0;
    
    // Initialize canvas size
    function initCanvas() {
        const size = Math.min(window.innerWidth * 0.9, 500);
        wheelCanvas.width = size;
        wheelCanvas.height = size;
        
        // Get the context
        const ctx = wheelCanvas.getContext('2d');
        ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
        
        // Initialize with empty wheel
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
        
        // Calculate the initial rotation offset
    // For a single option, we want it at the right side (3 o'clock position)
    // For multiple options, we'll start at the top (12 o'clock) for better distribution
    const initialRotation = options.length === 1 ? 0 : -Math.PI / 2;
    
    // For a single option, we need to rotate 180 degrees to get the text right-side up at 3 o'clock
    const textAngleOffset = options.length === 1 ? Math.PI : 0;
        
        options.forEach((option, index) => {
            // Calculate angles with initial rotation
            const startAngle = index * segmentAngle + currentRotation + initialRotation;
            const endAngle = (index + 1) * segmentAngle + currentRotation + initialRotation;
            
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
            // Position text at 20% of the radius from the center
            const textRadius = radius * 0.2;
            
            // Calculate text angle at the center of the segment
            // Apply textAngleOffset to ensure single option is at 0 degrees (right side)
            const textAngle = startAngle + (endAngle - startAngle) / 2 + textAngleOffset;
            
            // Always position text along the radius
            const textX = centerX + Math.cos(textAngle) * textRadius;
            const textY = centerY + Math.sin(textAngle) * textRadius;
            
            // Set text rotation to be parallel to the radius (pointing outward)
            // No flipping - text will follow the radius line exactly
            const textRotation = textAngle;
            
            // Rotate text to be readable
            ctx.translate(textX, textY);
            
            // Apply the rotation (no flipping)
            ctx.rotate(textRotation);
            
            // Style text
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';  // Align text to the left (toward the center of the wheel)
            ctx.textBaseline = 'middle';
            
            // Truncate text if it's too long
            let displayText = option;
            const maxWidth = radius * 0.8; // 80% of radius
            const ellipsis = '...';
            
            // Measure the text width
            let textWidth = ctx.measureText(displayText).width;
            
            // If text is too wide, truncate it with ellipsis
            if (textWidth > maxWidth) {
                // Calculate how many characters we can fit (approximate)
                // Subtract 5 more characters to ensure better fit
                const avgCharWidth = textWidth / displayText.length;
                let charsToKeep = Math.floor(maxWidth / avgCharWidth) - ellipsis.length - 5;
                
                // Ensure we keep at least 1 character plus ellipsis
                charsToKeep = Math.max(1, charsToKeep);
                
                // Truncate and add ellipsis
                displayText = displayText.substring(0, charsToKeep) + ellipsis;
                
                // Final check and adjustment if still too wide
                while (ctx.measureText(displayText).width > maxWidth && displayText.length > ellipsis.length) {
                    displayText = displayText.substring(0, displayText.length - ellipsis.length - 1) + ellipsis;
                }
            }
            
            // Draw the (possibly truncated) text
            ctx.fillText(displayText, 0, 0);
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
        if (option) {
            options.push(option);
            optionInput.value = '';
            updateOptionsList();
            drawWheel();
            updateAddButtonState();
        }
        optionInput.focus();
    }
    
    // Update the add button state based on input field content
    function updateAddButtonState() {
        const inputText = optionInput.value.trim();
        addBtn.disabled = inputText === '';
    }
    
    // Update the options list in the UI
    function updateOptionsList() {
        optionsList.innerHTML = '';
        
        // Show/hide clear link based on number of options
        const clearLink = document.getElementById('clearBtn');
        if (clearLink) {
            clearLink.style.display = options.length > 0 ? 'block' : 'none';
            // Ensure the clear link is properly hidden when there are no options
            if (options.length === 0) {
                clearLink.style.display = 'none';
            }
        }
        
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-item';
            optionElement.innerHTML = `
                ${option}
                <button class="option-remove" data-index="${index}">&times;</button>
            `;
            optionsList.appendChild(optionElement);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.option-remove').forEach(btn => {
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
    
    // Save wheel to Firestore
    function showError(message) {
        const errorElement = document.getElementById('wheelNameError');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    async function saveWheel() {
        const wheelName = wheelNameInput.value.trim();
        
        // Clear any previous messages
        document.getElementById('wheelNameError').classList.remove('show');
        
        if (!wheelName) {
            showError('Please enter a name for your wheel');
            return;
        }
        
        if (options.length === 0) {
            showError('Please add at least one option to the wheel');
            return;
        }
        
        try {
            // First check if the document exists to update the timestamp
            const docRef = wheelsRef.doc(wheelName);
            const doc = await docRef.get();
            
            const wheelData = {
                name: wheelName,
                options: options,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // If document doesn't exist, add createdAt
            if (!doc.exists) {
                wheelData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            }
            
            await docRef.set(wheelData);
            
            // Show success message
            const successMessage = document.getElementById('saveSuccessMessage');
            successMessage.textContent = 'Saved successfully!';
            successMessage.classList.add('show');
            
            // Clear the input
            wheelNameInput.value = '';
            
            // Hide the message after 3 seconds
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 3000);
            
            await loadSavedWheelsList();
        } catch (error) {
            // Error handled by UI feedback
            if (error.code === 'permission-denied') {
                alert('Permission denied. Please check your Firestore security rules.');
            } else {
                alert('Error saving wheel: ' + error.message);
            }
        }
    }
    
    // Load saved wheels list
    async function loadSavedWheelsList() {
        try {
            const snapshot = await wheelsRef.orderBy('updatedAt', 'desc').get();
            savedWheelsList.innerHTML = '';
            
            if (snapshot.empty) {
                savedWheelsList.innerHTML = '<div class="no-wheels">No saved wheels yet</div>';
                return;
            }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const wheelItem = document.createElement('div');
                wheelItem.className = 'wheel-item';
                wheelItem.dataset.id = doc.id;
                
                wheelItem.innerHTML = `
                    <a href="#" class="wheel-name" data-id="${doc.id}">${data.name}</a>
                    <button class="delete-wheel" data-id="${doc.id}" title="Delete wheel">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                `;
                
                savedWheelsList.appendChild(wheelItem);
            });
            
            // Add event listeners for the new elements
            document.querySelectorAll('.wheel-name').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadWheel(link.dataset.id);
                });
            });
            
            document.querySelectorAll('.delete-wheel').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteWheel(button.dataset.id);
                });
            });
            
        } catch (error) {
            // Error handled by UI feedback
            savedWheelsList.innerHTML = '<div class="error">Error loading wheels. Please refresh the page.</div>';
        }
    }
    
    // Load a specific wheel
    async function loadWheel(wheelId) {
        try {
            const doc = await wheelsRef.doc(wheelId).get();
            if (doc.exists) {
                const data = doc.data();
                options = [...data.options];
                currentRotation = 0;
                
                // Update the UI
                updateOptionsList();
                
                // Ensure canvas is properly sized before drawing
                const size = Math.min(window.innerWidth * 0.9, 500);
                const ctx = wheelCanvas.getContext('2d');
                ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
                
                // Redraw the wheel with the new options
                drawWheel();
                
                // Update the wheel name input
                wheelNameInput.value = data.name;
                
                // Scroll to the top of the page
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Show a brief highlight on the selected wheel
                const wheelItem = document.querySelector(`.wheel-item[data-id="${wheelId}"]`);
                if (wheelItem) {
                    wheelItem.style.backgroundColor = '#e3f2fd';
                    setTimeout(() => {
                        wheelItem.style.transition = 'background-color 1s';
                        wheelItem.style.backgroundColor = '';
                        setTimeout(() => {
                            wheelItem.style.transition = '';
                        }, 1000);
                    }, 1000);
                }
            }
        } catch (error) {
            // Error handled by UI feedback
            alert('Error loading wheel. Please try again.');
        }
    }
    
    // Delete a specific wheel
    async function deleteWheel(wheelId) {
        const confirmed = await modal.show({
            title: '',
            message: 'Are you sure you want to delete this wheel? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            showCancel: true,
            confirmButtonClass: 'clear-confirm-btn',
            cancelButtonClass: 'modal-btn-cancel'
        });
        
        if (!confirmed) {
            return;
        }
        
        try {
            await wheelsRef.doc(wheelId).delete();
            await loadSavedWheelsList();
        } catch (error) {
            // Error handled by UI feedback
            alert('Error deleting wheel. Please try again.');
        }
    }
    
    async function clearAll() {
        if (options.length === 0) return;
        
        const confirmed = await modal.show({
            title: 'Create New Wheel',
            message: 'Creating a new wheel will clear the existing options. Are you sure you want to continue?',
            confirmText: 'Continue',
            cancelText: 'Cancel',
            showCancel: true,
            confirmButtonClass: 'clear-confirm-btn',
            cancelButtonClass: 'modal-btn-cancel'
        });
        
        if (confirmed) {
            options = [];
            currentRotation = 0;
            const ctx = wheelCanvas.getContext('2d');
            ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
            drawWheel();
            updateOptionsList();
        }
    }
    
    // Event Listeners
    addBtn.addEventListener('click', addOption);
    optionInput.addEventListener('input', updateAddButtonState);
    optionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && optionInput.value.trim() !== '') {
            addOption();
        }
    });
    
    // Initial button state
    updateAddButtonState();
    
    // Set up clear button event listener
    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearAll();
        });
    }
    
    // Set up other event listeners
    spinBtn.addEventListener('click', spinWheel);
    saveWheelBtn.addEventListener('click', saveWheel);
    
    // Load saved wheels when the page loads
    loadSavedWheelsList();
    
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
            // Use the same initial rotation as in drawWheel()
            const initialRotation = options.length === 1 ? 0 : -Math.PI / 2;
            let angle = Math.atan2(dy, dx) - currentRotation - initialRotation;
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
