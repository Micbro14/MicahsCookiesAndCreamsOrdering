let workbook;
let additionalCosts;
let upcharge;
let lactaseDropsPerGram;
let lactaseDropsPerGramCost;


// storing worksheet as dictionaries to minimize future for loop needs
let milkWorksheet;
let thickenerWorksheet;
let flavorWorksheet;
let solidMixInWorksheet;
let sweetenerWorksheet;
let premadeWorksheet;

// storing specs dictionaries for pricing
let sizeOptions;
let sizeSpecsDict = {}; 
let liquidSpecs = {};
let thickenerSpecs = {};
let solidSpecs = {};
let sweetenerSpecs = {};

let address;
let gallonCost;
let carMpg;

function toggleCart() {
    const cart = document.getElementById('shoppingCart');
    cart.classList.toggle('show');
}

function clearField(fieldId) {
    document.getElementById(fieldId).value = '';
    calculateCustomizePrice();
}

function validateForm(button) {
    var form = document.getElementById('customizeForm');
    var isValid = true;

    // Check all required select elements
    var requiredSelects = form.querySelectorAll('select[required]');
    requiredSelects.forEach(function(select) {
        if (select.value === '') {
            isValid = false;
            select.classList.add('is-invalid'); // Add Bootstrap invalid class
        } else {
            select.classList.remove('is-invalid'); // Remove Bootstrap invalid class
        }
    });

    if (isValid) {
        const cartItemId = document.getElementById('cartItemId').value;

        // Get the selected values
        const name = document.getElementById('name').value;
        const iceCreamBase = document.getElementById('iceCreamBase').value;
        const milkType1 = document.getElementById('milkType1').value;
        const milkType2 = document.getElementById('milkType2').value;
        const thickener = document.getElementById('thickener').value;
        const thickenerAmount = document.getElementById('thickenerAmount').value;
        const liquidMix1 = document.getElementById('liquidMix1').value;
        const liquidMix1Amount = document.getElementById('liquidMix1Amount').value;
        const liquidMix2 = document.getElementById('liquidMix2').value;
        const liquidMix2Amount = document.getElementById('liquidMix2Amount').value;
        const mixIn1 = document.getElementById('mixIn1').value;
        const mixIn2 = document.getElementById('mixIn2').value;
        const mixInAmount = document.getElementById('mixInAmount').value;
        const sweetener1 = document.getElementById('sweetener1').value;
        const sweetener1Amount = document.getElementById('sweetener1Amount').value;
        const sweetener2 = document.getElementById('sweetener2').value;
        const sweetener2Amount = document.getElementById('sweetener2Amount').value;
        const size = document.querySelector('input[name="size"]:checked').value; // Get the selected size value
        const quantity = document.getElementById('quantity-customize').value;
        const pricePerQuantity = document.getElementById('pricePerQuantity').textContent;
        const totalPrice = document.getElementById('totalPrice').textContent;
        const lactoseCheckbox = document.getElementById("lactoseCheckboxCustomize");

        // Create a cart item using the template
        const template = document.getElementById('cart-item-template');
        const cartItem = template.content.cloneNode(true).querySelector('.cart-item');
        cartItem.id = cartItemId || `cart-item-${Date.now()}`;

        //get grams
        var liquidMix1Data = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix1, liquidMix1Amount, size, 'liquidMix1Price',null);
        var liquidMix2Data = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix2, liquidMix2Amount, size, 'liquidMix2Price',null);
        var sweetener1Data = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener1, sweetener1Amount, size, 'sweetener1Price',null);
        var sweetener2Data = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener2, sweetener2Amount, size, 'sweetener2Price',null);
        var solidSimulated = calculateSolidPrice(solidMixInWorksheet, solidSpecs, sizeSpecsDict, mixIn1, mixInAmount, size, 'mixIn1Price', mixIn2, 'mixIn2Price');


        var totalGramsBeforeMilk = (liquidMix1Data.thick === "Yes" ? liquidMix1Data.amount : 0) + (liquidMix2Data.thick === "Yes" ? liquidMix2Data.amount : 0) + (solidSimulated.gramsPerCup1 === 0 ? 0 : ((solidSimulated.amount1 / solidSimulated.gramsPerCup1) * 240) ) + (solidSimulated.gramsPerCup2 === 0 ? 0 : ((solidSimulated.amount2 / solidSimulated.gramsPerCup2) * 240) );

        var [milkType1Price,milkType1Grams,milkType1LactoseDrops] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, milkType1, size, 'milkType1Price', 2/3, totalGramsBeforeMilk);
        var [milkType2Price,milkType2Grams,milkType2LactoseDrops] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, milkType2, size, 'milkType2Price', 1/3, totalGramsBeforeMilk);

       

        var totalMilk = milkType1Grams + milkType2Grams;

        var thickenerData = calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickener, thickenerAmount, size, 'thickenerPrice',totalMilk);

        var lactaseDrops = 0;
        if(lactoseCheckbox.checked){
            var lactaseDrops = Math.ceil(milkType1LactoseDrops + milkType2LactoseDrops + thickenerData.lactaseDrops);
        }
    
        // Set the values
        cartItem.querySelector('.cart-item-name').textContent = `${name} - ${size}`;
        cartItem.querySelector('.ice-cream-base').textContent = iceCreamBase;
        cartItem.querySelector('.milk-type1').textContent = milkType1;
        cartItem.querySelector('.milk-type1-grams').textContent = milkType1Grams;
        cartItem.querySelector('.milk-type2').textContent = milkType2;
        cartItem.querySelector('.milk-type2-grams').textContent = milkType2Grams;
        cartItem.querySelector('.thickener').textContent = thickener;
        cartItem.querySelector('.thickener-amount').textContent = thickenerAmount;
        cartItem.querySelector('.thickener-grams').textContent = thickenerData.amount;
        cartItem.querySelector('.liquid-mix1').textContent = liquidMix1;
        cartItem.querySelector('.liquid-mix1-amount').textContent = liquidMix1Amount;
        cartItem.querySelector('.liquid-mix1-grams').textContent = liquidMix1Data.amount;
        cartItem.querySelector('.liquid-mix2').textContent = liquidMix2;
        cartItem.querySelector('.liquid-mix2-amount').textContent = liquidMix2Amount;
        cartItem.querySelector('.liquid-mix2-grams').textContent = liquidMix2Data.amount;
        cartItem.querySelector('.mix-in1').textContent = mixIn1;
        cartItem.querySelector('.mix-in1-grams').textContent = solidSimulated.amount1;
        cartItem.querySelector('.mix-in2').textContent = mixIn2;
        cartItem.querySelector('.mix-in2-grams').textContent = solidSimulated.amount2;
        cartItem.querySelector('.mix-in-amount').textContent = mixInAmount;
        cartItem.querySelector('.sweetener1').textContent = sweetener1;
        cartItem.querySelector('.sweetener1-amount').textContent = sweetener1Amount;
        cartItem.querySelector('.sweetener1-grams').textContent = sweetener1Data.amount;
        cartItem.querySelector('.sweetener2').textContent = sweetener2;
        cartItem.querySelector('.sweetener2-amount').textContent = sweetener2Amount;
        cartItem.querySelector('.sweetener2-grams').textContent = sweetener2Data.amount;
        cartItem.querySelector('.lactase-drops-checked').textContent = lactoseCheckbox.checked;
        console.log("lactase drops is ", lactaseDrops);
        cartItem.querySelector('.lactase-drops-grams').textContent = lactaseDrops;

        const quantityInput = cartItem.querySelector('.quantity');
        if (quantityInput) {
            quantityInput.value = quantity;
            quantityInput.setAttribute("value", quantity);  // Update the value attribute
            quantityInput.dispatchEvent(new Event('change'));  // Ensure any change events are triggered
        } else {
        }

        cartItem.querySelector('.cart-item-price').textContent = `${pricePerQuantity}`;

        if (cartItemId) {
            // Update the existing cart item
            document.getElementById(cartItemId).outerHTML = cartItem.outerHTML;
        } else {
            // Add the new cart item to the table
            document.querySelector('#cart-items').appendChild(cartItem);
        }

        // Close the modal
        $('#customizeModal').modal('hide');
        const cart = document.getElementById('shoppingCart');
        if (!cart.classList.contains('show')) {
            cart.classList.add('show');
        }

        // Update the total price (assuming you have a function to calculate the total price)
        updateTotalPrice();
    }
}

function toggleTable(button) {
    const cartItem = button.closest('.cart-item');
    const table = cartItem.querySelector('.collapse-table');
    $(table).collapse('toggle');
}


function updateTotalPrice() {
    // Calculate the total price based on the cart items
    let totalPrice = 0.00;

    // Iterate through each cart item and calculate the total price
    document.querySelectorAll('.cart-item').forEach(cartItem => {
        const quantity = parseInt(cartItem.querySelector('.quantity').value);
        const price = parseFloat(cartItem.querySelector('.cart-item-price').textContent.replace('$', ''));
        totalPrice += quantity * price;
    });


    // Update the total price element
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
    saveCart();
}


function editCartItem(button) { 

    cartItem = button.closest('.cart-item');

    cartItemId = cartItem.id;

    // Get the cart item row 
    const cartItemContainer = document.getElementById(cartItemId); 
    
    // Get the values from the cart item table
    const nameSizeText = cartItemContainer.querySelector('h5').textContent;
    const [name, size] = nameSizeText.split(' - ');
    const iceCreamBase = cartItemContainer.querySelector('tbody tr:nth-child(1) td:nth-child(2)').textContent;
    const milkType1 = cartItemContainer.querySelector('tbody tr:nth-child(2) td:nth-child(2)').textContent;
    const milkType2 = cartItemContainer.querySelector('tbody tr:nth-child(3) td:nth-child(2)').textContent;
    const thickener = cartItemContainer.querySelector('tbody tr:nth-child(4) td:nth-child(2)').textContent;
    const thickenerAmount = cartItemContainer.querySelector('tbody tr:nth-child(4) td:nth-child(3)').textContent;
    const liquidMix1 = cartItemContainer.querySelector('tbody tr:nth-child(5) td:nth-child(2)').textContent;
    const liquidMix1Amount = cartItemContainer.querySelector('tbody tr:nth-child(5) td:nth-child(3)').textContent;
    const liquidMix2 = cartItemContainer.querySelector('tbody tr:nth-child(6) td:nth-child(2)').textContent;
    const liquidMix2Amount = cartItemContainer.querySelector('tbody tr:nth-child(6) td:nth-child(3)').textContent;
    const mixIn1 = cartItemContainer.querySelector('tbody tr:nth-child(7) td:nth-child(2)').textContent;
    const mixInAmount = cartItemContainer.querySelector('tbody tr:nth-child(7) td:nth-child(3)').textContent;
    const mixIn2 = cartItemContainer.querySelector('tbody tr:nth-child(8) td:nth-child(2)').textContent;
    const sweetener1 = cartItemContainer.querySelector('tbody tr:nth-child(9) td:nth-child(2)').textContent;
    const sweetener1Amount = cartItemContainer.querySelector('tbody tr:nth-child(9) td:nth-child(3)').textContent;
    const sweetener2 = cartItemContainer.querySelector('tbody tr:nth-child(10) td:nth-child(2)').textContent;
    const sweetener2Amount = cartItemContainer.querySelector('tbody tr:nth-child(10) td:nth-child(3)').textContent;
    const lactoseFree = cartItemContainer.querySelector('tbody tr:nth-child(11) td:nth-child(3)').textContent;
    const quantity = cartItemContainer.querySelector('.quantity').value;

    // Set the values in the customize modal
    document.getElementById('name').value = name;
    document.getElementById('iceCreamBase').value = iceCreamBase;
    document.getElementById('milkType1').value = milkType1;
    document.getElementById('milkType2').value = milkType2;
    document.getElementById('thickener').value = thickener;
    document.getElementById('thickenerAmount').value = thickenerAmount;
    document.getElementById('liquidMix1').value = liquidMix1;
    document.getElementById('liquidMix1Amount').value = liquidMix1Amount;
    document.getElementById('liquidMix2').value = liquidMix2;
    document.getElementById('liquidMix2Amount').value = liquidMix2Amount;
    document.getElementById('mixIn1').value = mixIn1;
    document.getElementById('mixInAmount').value = mixInAmount;
    document.getElementById('mixIn2').value = mixIn2;
    document.getElementById('sweetener1').value = sweetener1;
    document.getElementById('sweetener1Amount').value = sweetener1Amount;
    document.getElementById('sweetener2').value = sweetener2;
    document.getElementById('sweetener2Amount').value = sweetener2Amount;
    var sizeElement = document.getElementById('size-customize');
    sizeElement.querySelectorAll('.btn-group .btn').forEach(button => {
        var input = button.querySelector('input');
        if (input && input.value === size) {
            button.classList.add('active'); // Add 'active' class to the matching button
            input.checked = true;          // Mark the corresponding input as checked
        } else {
            button.classList.remove('active'); // Remove 'active' class from non-matching buttons
            if (input) {
                input.checked = false;     // Ensure non-matching inputs are unchecked
            }
        }
    });

    document.getElementById('quantity-customize').value = quantity;
    document.getElementById("lactoseCheckboxCustomize").checked = lactoseFree;

    // Set the cart item ID in the hidden input field 
    document.getElementById('cartItemId').value = cartItemId; 
    // Change the button text to "Update" 
    document.getElementById('customizeAddToCart').textContent = 'Update'; 
    // Open the customize modal 
    $('#customizeModal').modal('show');
}

function removeCartItem(button) {

    cartItem = button.closest('.cart-item');
    // Remove the cart item
    document.getElementById(cartItem.id).remove();

    // Update the total price (assuming you have a function to calculate the total price)
    updateTotalPrice();
    saveCart();
}

$(document).ready(function() {
    $('#customizeModal').on('hidden.bs.modal', function () {
        resetCustomizeModal();
    });
});

function resetCustomizeModal() {
    // Reset form fields
    $('#name').val(''); 
    $('#iceCreamBase').val(''); 
    $('#milkType1').val(''); 
    $('#milkType1Price').val(''); 
    $('#milkType2').val(''); 
    $('#milkType2Price').val(''); 
    $('#thickener').val(''); 
    $('#thickenerAmount').val(''); 
    $('#thickenerPrice').val(''); 
    $('#liquidMix1').val(''); 
    $('#liquidMix1Amount').val(''); 
    $('#liquidMix1Price').val(''); 
    $('#liquidMix2').val('');
     $('#liquidMix2Amount').val(''); 
     $('#liquidMix2Price').val(''); 
     $('#mixIn1').val(''); 
     $('#mixIn1Price').val(''); 
     $('#mixIn2').val(''); 
     $('#mixIn2Price').val(''); 
     $('#mixIn1Amount').val(''); 
     $('#sweetener1').val(''); 
     $('#sweetener1Amount').val(''); 
     $('#sweetener1Price').val(''); 
     $('#sweetener2').val(''); 
     $('#sweetener2Amount').val(''); 
     $('#sweetener2Price').val(''); 
     $('#size-customize').val('');
     $('#quantity-customize').val(1);
     $('#additionalCosts').val(''); 
     $('#pricePerQuantity').val(''); 
     $('#totalPrice').val('');
     document.getElementById('cartItemId').value = ''; // Reset the cart item ID 
     document.getElementById('customizeAddToCart').textContent = 'Add To Cart';
    // Optionally, reset other elements or states within the modal
}

function adjustColor(hex, factor) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, r + factor));
    g = Math.min(255, Math.max(0, g + factor));
    b = Math.min(255, Math.max(0, b + factor));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to open the modal and populate the flavor card inside
function openFlavorModal(flavor) {
    var flavorData = premadeWorksheet[flavor]; 

    // Clone the flavor card template
    let flavorCard = document.getElementById('flavor-card-template').content.cloneNode(true);
    let flavorCardContainer = flavorCard.querySelector('.col-md-3'); // Select the div with the column class

    // Change column size only inside the modal
    if (flavorCardContainer) {
        flavorCardContainer.classList.remove('col-md-3');
        flavorCardContainer.classList.add('col-md-6');
    }

    // Populate the flavor card inside the modal
    flavorCard.querySelector('.card-img-top').src = `./images/${flavor}.png`;
    flavorCard.querySelector('.card-img-top').alt = flavor;
    flavorCard.querySelector('.card-title').textContent = flavor;
    flavorCard.querySelector('.card-description').innerHTML = flavorData.Description.split(/(?<=[.?!])\s+/).join('<br>');

    // Ensure size options only affect the modal
    var sizeElement = flavorCard.querySelector('#size-flavor');
    sizeElement.innerHTML = ''; // Clear previous size options (if any)

    sizeOptions.forEach((optionValue, index) => {
        var input = document.createElement('input'); 
        
        input.type = 'radio'; 
        input.name = `flavorModal-size-flavor-${flavor}`; // Use unique name for each flavor
        input.value = optionValue; 
        input.id = `flavorModal-size-flavor-${flavor}-${optionValue}`; 

        var label = document.createElement('label'); 
        label.className = 'btn btn-outline-primary'; 
        label.setAttribute('for', input.id); 
        label.innerHTML = optionValue; 

        if (premadeWorksheet[flavor]["Has Samples?"] == "No" && index === 0 || optionValue.startsWith('Sample') && premadeWorksheet[flavor]["Has Samples?"] == "Yes") { 
            input.checked = true; // Set the first button as active by default 
            label.classList.add('active', 'focus','checked'); // Add the "active" and "focus" classes to the first label
        }
        // Append the input element to the label 
        if (!optionValue.startsWith('Sample')) {
            label.appendChild(input);
            sizeElement.appendChild(label);
        }else if(optionValue.startsWith('Sample') && premadeWorksheet[flavor]["Has Samples?"] == "Yes"){
            label.appendChild(input);
            // Insert the label at the beginning of sizeElement
            sizeElement.insertBefore(label, sizeElement.firstChild);

            // Remove the "Customize It!" button
            if (customizeButton) {
                customizeButton.remove();
            }
            // Remove the "Make it Lactose Free" checkbox
            var lactoseCheckbox = clone.querySelector('#lactoseCheckbox');
            if (lactoseCheckbox) {
                lactoseCheckbox.remove();
            }

            // Remove the label for the "Make it Lactose Free" checkbox
            var lactoseLabel = clone.querySelector('label[for="lactoseCheckbox"]');
            if (lactoseLabel) {
                lactoseLabel.remove();
            }
        }

        
    });

    // Get the price based on the default size selection (first one)
    var firstSize = sizeElement.querySelector('input:checked').value;
    var price = calculateCustomizePriceFromFlavor(firstSize, flavor, false);
    flavorCard.querySelector('.card-price').textContent = `$${price}`;

    // Get the quantity and other form elements
    var quantityInput = flavorCard.querySelector('.form-control');
    var quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    // Change the ID of the quantity input to be unique for the modal
    quantityInput.id = `modal-quantity-${flavor}`;
    quantityInput.addEventListener('input', function () {
        quantity = parseInt(quantityInput.value);
    });

    // Handle Lactose Free checkbox for the modal
    var lactoseCheckbox = flavorCard.querySelector('#lactoseCheckbox');
    if (lactoseCheckbox) {
        lactoseCheckbox.id = `modal-lactoseCheckbox-${flavor}`; // Change the ID to be unique
        var lactoseLabel = flavorCard.querySelector('label[for="lactoseCheckbox"]');
        if (lactoseLabel) {
            lactoseLabel.setAttribute('for', `modal-lactoseCheckbox-${flavor}`); // Link label to the new ID
        }
    }

    // Add "Add to Cart" button functionality inside the modal
    var addToCartButton = flavorCard.querySelector('.add-to-cart');
    addToCartButton.addEventListener('click', function() {
        var selectedSize = sizeElement.querySelector('input:checked').value;
        var price = calculateCustomizePriceFromFlavor(selectedSize, flavor, false);

        // Get the quantity and lactose-free status
        var quantity = parseInt(quantityInput.value);
        var lactoseFree = lactoseCheckbox ? lactoseCheckbox.checked : false;
    
        // Close the modal after adding to the cart     
        document.getElementById('flavorModal').classList.remove('show');
        //document.getElementById('flavorModal').style.display = 'none';


        // Wait for modal to fully close before proceeding
        addToCart(flavor, premadeWorksheet, quantity, price, selectedSize, lactoseFree);
    });

    // Add "Customize It!" event listener inside modal
    var customizeButton = flavorCard.querySelector('.customize-btn');
    customizeButton.addEventListener('click', function() {
        var selectedSize = sizeElement.querySelector('input:checked').value;
        var quantity = parseInt(quantityInput.value);
        var lactoseFree = lactoseCheckbox ? lactoseCheckbox.checked : false;

        autoSelectValues(flavor, worksheet, selectedSize, quantity, lactoseFree);
    });

     // **Event Listener for Size Selection**
     flavorCard.querySelectorAll('label[for^="flavorModal-size-flavor-"]').forEach(label => {
        label.addEventListener('click', function() {
            setTimeout(() => {
                flavorCard = document.getElementById('flavorModal');
                if (this.classList.contains('active')) {
                    var parts = this.getAttribute('for').split('-'); 
                    var newSize = parts[parts.length - 1];
                    var lactoseActive = lactoseCheckbox ? lactoseCheckbox.checked : false;
                    var newPrice = calculateCustomizePriceFromFlavor(newSize, flavor, lactoseActive);
                    console.log("new price is " + newPrice);
                    flavorCard.querySelector('.card-price').textContent = `$${newPrice}`;
                }
            }, 0);
        });
    });

    // **Event Listener for Lactose-Free Checkbox**
    if (lactoseCheckbox) {
        lactoseCheckbox.addEventListener('change', function() {
            flavorCard = document.getElementById('flavorModal');
            var activeLabel = flavorCard.querySelector('label.active');   
            console.log("active label is " + activeLabel);  
            var newSize = activeLabel ? activeLabel.getAttribute('for').split('-').pop() : sizeOptions[0];
            var newPrice = calculateCustomizePriceFromFlavor(newSize, flavor, this.checked);

            flavorCard.querySelector('.card-price').textContent = `$${newPrice}`;
        });
    }

   // Append the populated card to the modal
   document.getElementById('flavor-card-container').innerHTML = ''; // Clear previous modal content
   document.getElementById('flavor-card-container').appendChild(flavorCard);

   // Show the modal
   let flavorModal = new bootstrap.Modal(document.getElementById('flavorModal'));
   flavorModal.show();
}


function populateFlavorCards(sheetName) {
    var worksheet = workbook.Sheets[sheetName]; 
    var specsWorksheet = workbook.Sheets["Specs"]; 

    var flavorCardsContainer = document.getElementById('flavor-cards');
    flavorCardsContainer.innerHTML = ''; // Clear existing flavor cards

    var currentGroup = null;
    var featuredGroup = null;

    // get size values
    // Handle size options as buttons
    sizeOptions = [];

    for (var i = 2; i <= Object.keys(specsWorksheet).length; i++) { // Skip header row 
        var cellAddress = `${"A"}${i}`; 
        var cell = specsWorksheet[cellAddress]; 
        if (cell && cell.v && !cell.v.startsWith("_")) { 
            sizeOptions.push(cell.v);
        }
    }

    for (var i = 2; i <= Object.keys(worksheet).length; i++) { // Skip header row 
        var flavorCellAddress = `A${i}`; 
        var priceCellAddress = `AJ${i}`; 
        var imageCellAddress = `A${i}`; 

        var flavorCell = worksheet[flavorCellAddress]; 
        var priceCell = worksheet[priceCellAddress]; 
        var imageCell = worksheet[imageCellAddress]; 
        if (flavorCell && flavorCell.v){
            var flavor = flavorCell.v; 

            if (flavor === "_NOT FEATURED") 
            { 
                break; // End the loop if the flavor is "_NOT FEATURED" 
            }

            let navigationLinks = document.getElementById('navigation-links');

            if (flavor.startsWith('_') && !flavor.startsWith('__') ) {
              if (flavor.includes("FEATURED:")) {
                // Create a new featured group header
                featuredGroup = document.createElement('div'); 
                featuredGroup.className = 'row flavor-group featured-group'; 
            
                // Create a sticky header with an ID
                var header = document.createElement('div');
                header.className = 'sticky-header';
                var headerText = flavor.replace("FEATURED:", "").trim().substring(1);
                header.innerHTML = `<h3 id="${headerText}" class="col-12">${headerText}</h3>`;
                featuredGroup.appendChild(header);
            
                // Create and add navigation link
                var navLink = document.createElement('li');
                navLink.innerHTML = `<a href="#${headerText}">${headerText}</a>`;
                navigationLinks.insertBefore(navLink, navigationLinks.firstChild);
            
                // Update colors based on provided hex code
                const hexCode = premadeWorksheet[flavor]["Description"]; // Replace with your desired hex code
            
                if (hexCode != null) {
                  featuredGroup.style.backgroundColor = hexCode;
                  featuredGroup.style.borderColor = hexCode;
                  header.querySelector('h3').style.color = adjustColor(hexCode, 40);
                }
            
                flavorCardsContainer.insertAdjacentElement('afterbegin', featuredGroup);
              } else {
                // Create a new group header
                featuredGroup = null;
                currentGroup = document.createElement('div'); 
                currentGroup.className = 'row flavor-group'; 
            
                // Create a sticky header with an ID
                var header = document.createElement('div');
                header.className = 'sticky-header';
                var headerText = flavor.substring(1);
                header.innerHTML = `<h3 id="${headerText}" class="col-12">${headerText}</h3>`;
                currentGroup.appendChild(header);
            
                // Create and add navigation link
                var navLink = document.createElement('li');
                navLink.innerHTML = `<a href="#${headerText}">${headerText}</a>`;
                navigationLinks.appendChild(navLink);
            
                flavorCardsContainer.appendChild(currentGroup);
              }                
            }
            else if (flavor.startsWith('_') && flavor.startsWith('__') ){
                // do nothing
            }
            else {
                if (priceCell && priceCell.v && imageCell && imageCell.v) { 
                    var imageUrl = `./images/${imageCell.v}.png`;

                    
                    // Clone the template
                    var template = document.getElementById('flavor-card-template');
                    var clone = template.content.cloneNode(true);

                    // Populate the clone with data
                    clone.querySelector('.card-img-top').src = imageUrl;
                    clone.querySelector('.card-img-top').alt = flavor;
                    clone.querySelector('.card-title').textContent = flavor;
                    
                    const description = premadeWorksheet[flavor]["Description"];
                    const formattedDescription = description ? description.split(/(?<=[.?!])\s+/).join('\n') : "";
                    clone.querySelector('.card-description').innerHTML = formattedDescription.replace(/\n/g, '<br>');


                    
                    var customizeButton = clone.querySelector('.customize-btn');

                    // Create a new sizeElement for each flavor card
                    var sizeElement = document.createElement('div');
                    sizeOptions.forEach((optionValue, index) => {
                        var input = document.createElement('input'); 
                        
                        input.type = 'radio'; 
                        input.name = `size-flavor-${flavor}`; // Use unique name for each flavor
                        input.value = optionValue; 
                        input.id = `size-flavor-${flavor}-${optionValue}`; 

                        var label = document.createElement('label'); 
                        label.className = 'btn btn-outline-primary'; 
                        label.setAttribute('for', input.id); 
                        label.innerHTML = optionValue; 

                        if (premadeWorksheet[flavor]["Has Samples?"] == "No" && index === 0 || optionValue.startsWith('Sample') && premadeWorksheet[flavor]["Has Samples?"] == "Yes") { 
                            input.checked = true; // Set the first button as active by default 
                            label.classList.add('active', 'focus','checked'); // Add the "active" and "focus" classes to the first label
                        }
                        // Append the input element to the label 
                        if (!optionValue.startsWith('Sample')) {
                            label.appendChild(input);
                            sizeElement.appendChild(label);
                        }else if(optionValue.startsWith('Sample') && premadeWorksheet[flavor]["Has Samples?"] == "Yes"){
                            label.appendChild(input);
                            // Insert the label at the beginning of sizeElement
                            sizeElement.insertBefore(label, sizeElement.firstChild);

                            // Remove the "Customize It!" button
                            if (customizeButton) {
                                customizeButton.remove();
                            }
                            // Remove the "Make it Lactose Free" checkbox
                            var lactoseCheckbox = clone.querySelector('#lactoseCheckbox');
                            if (lactoseCheckbox) {
                                lactoseCheckbox.remove();
                            }

                            // Remove the label for the "Make it Lactose Free" checkbox
                            var lactoseLabel = clone.querySelector('label[for="lactoseCheckbox"]');
                            if (lactoseLabel) {
                                lactoseLabel.remove();
                            }
                        }

                        
                    });
                    
                    console.log("Current flavor is ",flavor);


                    var firstSize = sizeElement.querySelector('label').getAttribute('for').split('-').pop();
                    var price = calculateCustomizePriceFromFlavor(firstSize,flavor,false);

                    clone.querySelector('.card-price').textContent = `$${price}`;

                    clone.querySelector('#size-flavor').innerHTML = sizeElement.innerHTML;
                    clone.querySelector('.form-control').id = `quantity-${flavor.toLowerCase()}`;
                    clone.querySelector('.add-to-cart').setAttribute('data-flavor', flavor);
                    customizeButton = clone.querySelector('.customize-btn');
                    if(customizeButton){
                        clone.querySelector('.customize-btn').setAttribute('data-flavor', flavor);
                    }

                    if (featuredGroup) 
                    { 
                        featuredGroup.appendChild(clone); 
                    } else if (currentGroup) 
                    { 
                        currentGroup.appendChild(clone);
                    } else { 
                        flavorCardsContainer.appendChild(clone); 
                    }
                }

            }
        }
    }

    // Add event listener for label class changes
    document.querySelectorAll('label[for^="size-flavor-"]').forEach(label => {
        label.addEventListener('click', function() {
            setTimeout(() => {
                if (this.classList.contains('active')) {
                    var parts = this.getAttribute('for').split('-'); 
                    var flavor = parts.slice(2, -1).join('-'); 
                    var newSize = parts[parts.length - 1];
                    var lactoseCheckbox = this.closest('.card-body').querySelector('#lactoseCheckbox');
                    var lactoseActive = false;
                    if(lactoseCheckbox){
                        lactoseActive = lactoseCheckbox.checked;
                    }
                    var newPrice = calculateCustomizePriceFromFlavor(newSize, flavor,lactoseActive);
                    this.closest('.card-body').querySelector('.card-price').textContent = `$${newPrice}`;
                }
            }, 0);
        });
    });

    // Add event listener for lactoseCheckbox
    document.querySelectorAll('#lactoseCheckbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            var cardBody = this.closest('.card-body');
            var activeLabel = cardBody.querySelector('label.active');     
            var flavor = this.closest('.card-body').querySelector('.card-title').textContent;

            var newSize;
            if (activeLabel) {
                var parts = activeLabel.getAttribute('for').split('-');        
                newSize = parts[parts.length - 1];            
            }else{

                newSize = sizeOptions[0];
            }

             // Recalculate the price based on current size and flavor
             var newPrice = calculateCustomizePriceFromFlavor(newSize, flavor,this.checked);
             console.log("new price is ",newPrice);

             // Update the displayed price
             cardBody.querySelector('.card-price').textContent = `$${newPrice}`;
        });
    });

    // Add event listener for "Customize It!" buttons 
    document.querySelectorAll('.customize-btn').forEach(button => { 
        button.addEventListener('click', function() { 
            var flavor = this.getAttribute('data-flavor'); 
            var size = document.querySelector(`#size-flavor .btn.active input`); // Get the selected size
            if(!size){
                size = Object.keys(sizeSpecsDict)[0];
            }else{
                size = size.value
            }

            var lactoseCheckbox = this.closest('.card-body').querySelector('#lactoseCheckbox');

            var quantity = document.getElementById(`quantity-${flavor.toLowerCase()}`).value;
            autoSelectValues(flavor, worksheet, size, quantity, lactoseCheckbox.checked); 
        }); 
    });

    // Add event listener for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => { 
        button.addEventListener('click', function() { 
            var flavor = this.getAttribute('data-flavor'); 
            var quantity = this.closest('.card-body').querySelector('.quantity').value;
            var sizeElement = this.closest('.card-body').querySelector('input[name^="size-flavor-"]:checked');
            
            var size = sizeElement 
            ? sizeElement.value 
            : this.closest('.card-body').querySelector('input[name^="size-flavor-"]').value;

            var priceElement = this.closest('.card-body').querySelector('.card-price'); 
            var lactoseCheckbox = this.closest('.card-body').querySelector('#lactoseCheckbox');

            console.log("Lactose checkbox is ",lactoseCheckbox);

            addToCart(flavor, premadeWorksheet, quantity, priceElement.innerText, size,lactoseCheckbox); 
            saveCart();
        }); 
    });

}

function decreaseQuantity(button) {
    const input = button.closest('.input-group').querySelector('.quantity');
    let value = parseInt(input.value);
    if (value > 1) {
        value--;
        input.value = value;
    }
    calculateCustomizePrice();
}

function increaseQuantity(button) {
    const input = button.closest('.input-group').querySelector('.quantity');
    let value = parseInt(input.value);
    value++;
    input.value = value;
    calculateCustomizePrice();
}

function addToCart(flavor, worksheet, quantity,price,size,lactoseCheckbox) {
    var name = flavor;
    var iceCreamBase = "";

    var milkType1 = worksheet[flavor]["Milk Type 1 (2/3)"];
    var milkType2 = worksheet[flavor]["Milk Type 2 (1/3)"];
    var thickener = worksheet[flavor]["Thickener"];
    var thickenerAmount = worksheet[flavor]["Thickener Amount (x tbsp)"];
    var liquidMix1 = worksheet[flavor]["Liquid Mix 1"];
    var liquidMix1Amount = worksheet[flavor]["Liquid Mix 1 Amount (x tbsp)"];
    var liquidMix2 = worksheet[flavor]["Liquid Mix 2"];
    var liquidMix2Amount = worksheet[flavor]["Liquid Mix 2 Amount (x tbsp)"];
    var mixIn1 = worksheet[flavor]["Solid Mix 1"];
    var mixIn2 = worksheet[flavor]["Solid Mix 2"];
    var mixInAmount = worksheet[flavor]["Solid Mix Amount (% of all ice cream)"];
    var sweetener1 = worksheet[flavor]["Sweetner Type 1"];
    var sweetener1Amount = worksheet[flavor]["Sweetner Type 1 Amount (x 100g)"];
    var sweetener2 = worksheet[flavor]["Sweetner Type 2"];
    var sweetener2Amount = worksheet[flavor]["Sweetner Type 2 Amount (x 100g)"];

    // Get the template and clone it
    const template = document.getElementById('cart-item-template');
    const cartItem = template.content.cloneNode(true);

    // Generate a unique ID for the cart item and collapse div
    const uniqueId = `cart-item-${Date.now()}`;

    //get grams
    var liquidMix1Data = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix1, liquidMix1Amount, size, 'liquidMix1Price',null);
    var liquidMix2Data = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix2, liquidMix2Amount, size, 'liquidMix2Price',null);
    var sweetener1Data = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener1, sweetener1Amount, size, 'sweetener1Price',null);
    var sweetener2Data = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener2, sweetener2Amount, size, 'sweetener2Price',null);
    var solidSimulated = calculateSolidPrice(solidMixInWorksheet, solidSpecs, sizeSpecsDict, mixIn1, mixInAmount, size, 'mixIn1Price', mixIn2, 'mixIn2Price',null);


    var totalGramsBeforeMilk = (liquidMix1Data.thick === "Yes" ? liquidMix1Data.amount : 0) + (liquidMix2Data.thick === "Yes" ? liquidMix2Data.amount : 0) + (solidSimulated.gramsPerCup1 === 0 ? 0 : ((solidSimulated.amount1 / solidSimulated.gramsPerCup1) * 240) ) + (solidSimulated.gramsPerCup2 === 0 ? 0 : ((solidSimulated.amount2 / solidSimulated.gramsPerCup2) * 240) );

    var [milkType1Price,milkType1Grams,milkType1LactoseDrops] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, milkType1, size, 'milkType1Price', 2/3, totalGramsBeforeMilk);
    var [milkType2Price,milkType2Grams,milkType2LactoseDrops] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, milkType2, size, 'milkType2Price', 1/3, totalGramsBeforeMilk);


    var totalMilk = milkType1Grams + milkType2Grams;

    var thickenerData = calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickener, thickenerAmount, size, 'thickenerPrice',totalMilk);


    var lactaseDrops = 0;
    var lactoseActive = false;
    if(lactoseCheckbox){
        lactoseActive = lactoseCheckbox.checked;
    }

    if(lactoseActive){
        lactaseDrops = Math.ceil(milkType1LactoseDrops + milkType2LactoseDrops + thickenerData.lactaseDrops);
    }

    var gramAmountsDevMode = `
    milkType1Grams: ${milkType1Grams} <br>
    milkType2Grams: ${milkType2Grams} <br>
    thickener.amount: ${thickenerData.amount} <br>
    Sweetener 1 Amount: ${sweetener1Data.amount} <br>
    Sweetener 2 Amount: ${sweetener2Data.amount} <br>
    liquidMix1.amount: ${liquidMix1Data.amount} <br>
    liquidMix2.amount: ${liquidMix2Data.amount} <br>    
    Solid 1 Amount: ${solidSimulated.amount1} <br>
    Solid 2 Amount: ${solidSimulated.amount2} <br>     
    `;        
    //console.log("Grams amount dev mode is ", gramAmountsDevMode);

    // Set the values
    cartItem.querySelector('.cart-item').id = uniqueId;
    cartItem.querySelector('.cart-item-name').textContent = `${name} - ${size}`;
    cartItem.querySelector('.ice-cream-base').textContent = iceCreamBase;
    cartItem.querySelector('.milk-type1').textContent = milkType1;
    cartItem.querySelector('.milk-type1-grams').textContent = milkType1Grams;
    cartItem.querySelector('.milk-type2').textContent = milkType2;
    cartItem.querySelector('.milk-type2-grams').textContent = milkType2Grams;
    cartItem.querySelector('.thickener').textContent = thickener;
    cartItem.querySelector('.thickener-amount').textContent = thickenerAmount;
    cartItem.querySelector('.thickener-grams').textContent = thickenerData.amount;
    cartItem.querySelector('.liquid-mix1').textContent = liquidMix1;
    cartItem.querySelector('.liquid-mix1-amount').textContent = liquidMix1Amount;
    cartItem.querySelector('.liquid-mix1-grams').textContent = liquidMix1Data.amount;
    cartItem.querySelector('.liquid-mix2').textContent = liquidMix2;
    cartItem.querySelector('.liquid-mix2-amount').textContent = liquidMix2Amount;
    cartItem.querySelector('.liquid-mix2-grams').textContent = liquidMix2Data.amount;
    cartItem.querySelector('.mix-in1').textContent = mixIn1;
    cartItem.querySelector('.mix-in1-grams').textContent = solidSimulated.amount1;
    cartItem.querySelector('.mix-in2').textContent = mixIn2;
    cartItem.querySelector('.mix-in2-grams').textContent = solidSimulated.amount2;
    cartItem.querySelector('.mix-in-amount').textContent = mixInAmount;
    cartItem.querySelector('.sweetener1').textContent = sweetener1;
    cartItem.querySelector('.sweetener1-amount').textContent = sweetener1Amount;
    cartItem.querySelector('.sweetener1-grams').textContent = sweetener1Data.amount;
    cartItem.querySelector('.sweetener2').textContent = sweetener2;
    cartItem.querySelector('.sweetener2-amount').textContent = sweetener2Amount;
    cartItem.querySelector('.sweetener2-grams').textContent = sweetener2Data.amount;
    cartItem.querySelector('.lactase-drops-checked').textContent = lactoseActive;
    cartItem.querySelector('.lactase-drops-grams').textContent = lactaseDrops;
    cartItem.querySelector('.quantity').value = quantity;
    cartItem.querySelector('.cart-item-price').innerText = price;

    // Set the collapse div ID and button data-target
    const collapseDiv = cartItem.querySelector('.collapse');
    collapseDiv.id = uniqueId;
    cartItem.querySelector('.btn-link').setAttribute('data-target', `#${uniqueId}`);

    // Append the cart item to the cart
    document.querySelector('#cart-items').appendChild(cartItem);

    // Update the total price (assuming you have a function to calculate the total price)
    updateTotalPrice();

    const cart = document.getElementById('shoppingCart');
    if (!cart.classList.contains('show')) {
        cart.classList.add('show');
    }

}

function setCustomizeValue(value, elementId) { 
    document.getElementById(elementId).value = value;
}

function calculateSegmentPrice(worksheet, specsDict, sizeSpecsDict, value, amountValue, size, priceId,milkAmount) {
    console.log("Value is " + value);
    if (value == "Caramel"){
        console.log("Caramel was picked");
        console.log("Worksheet is " + JSON.stringify(worksheet, null, 2));
    }

   
    if (value === '' || amountValue === '' || !worksheet.hasOwnProperty(value)) {
        if (priceId) document.getElementById(priceId).innerText = ``;
        return { amount: 0, price: 0 };
    }

    

    var amount = (specsDict[amountValue] * sizeSpecsDict[size].Multiplier); 
      
    var cost = worksheet[value]["Cost ($)"];

    var price = amount * cost * upcharge;
    price = price.toFixed(2);
    
    var thick;

    if (worksheet[value].hasOwnProperty("Thick?")) {
        thick = worksheet[value]["Thick?"];
    }

    var lactaseDrops;

    if (worksheet[value].hasOwnProperty("Lactose Drops Needed")) {
        lactaseDrops = worksheet[value]["Lactose Drops Needed"];
        lactaseDrops = lactaseDrops * 15;
    }

    if (worksheet === flavorWorksheet || (worksheet === thickenerWorksheet && amountValue !== "Auto")) {
        amount = amount * 15;
        if (worksheet[value].hasOwnProperty("Lactose Drops Needed")) {
            lactaseDrops = lactaseDrops * 15;
        }
    } else if (worksheet === sweetenerWorksheet) {
        amount = amount * sweetenerWorksheet[value]["gram equivalent (of 1/2 cup)"];
        // TODO: need to use custom gram value when calculating costs
    } else if (worksheet === thickenerWorksheet && amountValue === "Auto"){
        amount = (thickenerWorksheet[value]["Amount per 100g of milk"] / 100) * milkAmount;
        price = (amount / 15) * cost * upcharge;
        price = price.toFixed(2);
    }

    if (priceId) document.getElementById(priceId).innerText = `$${price}`;

    return { amount: amount, price: parseFloat(price), thick: thick, lactaseDrops: lactaseDrops };
}

function calculateSolidPrice(worksheet, specsDict, sizeSpecsDict, value1, amountValue, size, priceId, value2, price2Id) {
    var splitAmount = 0.5;

    if (value1 === '' || amountValue === '' || !worksheet.hasOwnProperty(value1)) {
        if (priceId) document.getElementById(priceId).innerText = ``;
        if (price2Id) document.getElementById(price2Id).innerText = ``;
        return { cupAmount: 0, price1: 0, price2: 0, amount1: 0, amount2:0, gramsPerCup1: 0, gramsPerCup2:0 };
    }

    if (value2 === '' || !worksheet.hasOwnProperty(value2)) {
        splitAmount = 1;
        if (price2Id) document.getElementById(price2Id).innerText = ``;
    }

    var cupAmount = (sizeSpecsDict[size].Amount * specsDict[amountValue]);

    var value1gramsPerCup = worksheet[value1]["grams (from cups)"];
    var value1Grams = cupAmount / 240 * value1gramsPerCup * splitAmount;
    var cost1 = worksheet[value1]["Cost ($)"];
    var price1 = (value1Grams / value1gramsPerCup) * upcharge * cost1;
    price1 = price1.toFixed(2);
    if (priceId) document.getElementById(priceId).innerText = `$${price1}`;
    
    var value2Grams = 0;
    var price2 = 0;
    var value2gramsPerCup = 0;
    if (value2 !== '' && worksheet.hasOwnProperty(value2) && worksheet[value2].hasOwnProperty("grams (from cups)")) {
        value2gramsPerCup = worksheet[value2]["grams (from cups)"];
        value2Grams = cupAmount / 240 * value2gramsPerCup * splitAmount;
        var cost2 = worksheet[value2]["Cost ($)"];
        price2 = (value2Grams / value2gramsPerCup) * upcharge * cost2;
        price2 = price2.toFixed(2);
        if (price2Id) document.getElementById(price2Id).innerText = `$${price2}`;
    }

    return { cupAmount: cupAmount, price1: parseFloat(price1), price2: parseFloat(price2), amount1: value1Grams, amount2:value2Grams, gramsPerCup1:value1gramsPerCup, gramsPerCup2:value2gramsPerCup };
}

function calculateMilkPrice(worksheet, sizeSpecsDict, value, size, priceId, milkPortion, totalGramsBeforeMilk) {
    if (value === '') {
        if (priceId) document.getElementById(priceId).innerText = ``;
        return [0,0];
    }

    var cost = worksheet[value]["Cost ($)"];
    var grams = (sizeSpecsDict[size].Amount - totalGramsBeforeMilk) * milkPortion;
    var lactaseDrops;

    if (worksheet[value].hasOwnProperty("Lactose Drops Needed")) {
        lactaseDrops = worksheet[value]["Lactose Drops Needed"] * (grams / 240);
    }

    var price = (grams / 240) * cost * upcharge;
    price = price.toFixed(2);
    if (priceId) document.getElementById(priceId).innerText = `$${price}`;                   

    return [parseFloat(price),grams,lactaseDrops];
}

function calculateCustomizePrice() {
    var size = document.querySelector(`#size-customize input[name="size"]:checked`).value;
    
    var milk1Value = document.getElementById('milkType1').value;
    var milk2Value = document.getElementById('milkType2').value;
    var thickenerValue = document.getElementById('thickener').value;
    var liquidMix1Value = document.getElementById('liquidMix1').value;
    var liquidMix2Value = document.getElementById('liquidMix2').value;
    var sweetener1Value = document.getElementById('sweetener1').value;
    var sweetener2Value = document.getElementById('sweetener2').value;
    var solid1Value = document.getElementById('mixIn1').value;
    var solid2Value = document.getElementById('mixIn2').value;
    var solid2Value = document.getElementById('mixIn2').value;
    const lactoseCheckbox = document.getElementById("lactoseCheckboxCustomize");

    if(liquidMix2Value == "Caramel"){
        console.log("Caramel was found");
    }

    var liquidMix1 = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix1Value, document.getElementById('liquidMix1Amount').value, size, 'liquidMix1Price',null);
    var liquidMix2 = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix2Value, document.getElementById('liquidMix2Amount').value, size, 'liquidMix2Price',null);
    var sweetener1 = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener1Value, document.getElementById('sweetener1Amount').value, size, 'sweetener1Price',null);
    var sweetener2 = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener2Value, document.getElementById('sweetener2Amount').value, size, 'sweetener2Price',null);
    var solidSimulated = calculateSolidPrice(solidMixInWorksheet, solidSpecs, sizeSpecsDict, solid1Value, document.getElementById('mixInAmount').value, size, 'mixIn1Price', solid2Value, 'mixIn2Price');


    var totalGramsBeforeMilk = (liquidMix1.thick === "Yes" ? liquidMix1.amount : 0) + (liquidMix2.thick === "Yes" ? liquidMix2.amount : 0) + (solidSimulated.gramsPerCup1 === 0 ? 0 : ((solidSimulated.amount1 / solidSimulated.gramsPerCup1) * 240) ) + (solidSimulated.gramsPerCup2 === 0 ? 0 : ((solidSimulated.amount2 / solidSimulated.gramsPerCup2) * 240) );

    var [milkType1Price,milkType1Grams,milkType1LactoseDrops] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, milk1Value, size, 'milkType1Price', 2/3, totalGramsBeforeMilk);
    var [milkType2Price,milkType2Grams,milkType2LactoseDrops] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, milk2Value, size, 'milkType2Price', 1/3, totalGramsBeforeMilk);

    var totalMilk = milkType1Grams + milkType2Grams;
    var thickener = calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, thickenerValue, document.getElementById('thickenerAmount').value, size, 'thickenerPrice',totalMilk);

    var lactaseDrops = 0;
    if(lactoseCheckbox.checked){
        var lactaseDrops = Math.ceil(milkType1LactoseDrops + milkType2LactoseDrops + thickener.lactaseDrops);
    }

    console.log("Total lactase drops is ",lactaseDrops);

    var gramAmountsDevMode = `
        milkType1Grams: ${milkType1Grams} <br>
        milkType2Grams: ${milkType2Grams} <br>
        thickener.amount: ${thickener.amount} <br>
        Sweetener 1 Amount: ${sweetener1.amount} <br>
        Sweetener 2 Amount: ${sweetener2.amount} <br>
        liquidMix1.amount: ${liquidMix1.amount} <br>
        liquidMix2.amount: ${liquidMix2.amount} <br>    
        Solid 1 Amount: ${solidSimulated.amount1} <br>
        Solid 2 Amount: ${solidSimulated.amount2} <br>   
        Lactase drops:  ${lactaseDrops} <br>   
        `;        
    
    //console.log("Grams amount dev mode is ", gramAmountsDevMode);

    var totalCalories = 0;

    if (thickener.amount && thickenerWorksheet[thickenerValue] && thickenerWorksheet[thickenerValue]["Calories"]) {
        var thickenerCalories = (thickener.amount / 15) * thickenerWorksheet[thickenerValue]["Calories"];
        totalCalories += thickenerCalories;
    }

    if (liquidMix1.amount && flavorWorksheet[liquidMix1Value] && flavorWorksheet[liquidMix1Value]["Calories"]) {
        var liquidMix1Calories = (liquidMix1.amount / 15) * flavorWorksheet[liquidMix1Value]["Calories"];
        totalCalories += liquidMix1Calories;
    }

    if (liquidMix2.amount && flavorWorksheet[liquidMix2Value] && flavorWorksheet[liquidMix2Value]["Calories"]) {
        var liquidMix2Calories = (liquidMix2.amount / 15) * flavorWorksheet[liquidMix2Value]["Calories"];
        totalCalories += liquidMix2Calories;
    }

    if (sweetener1.amount && sweetenerWorksheet[sweetener1Value] && sweetenerWorksheet[sweetener1Value]["gram equivalent (of 1/2 cup)"] && sweetenerWorksheet[sweetener1Value]["Calories"]) {
        var sweetener1Calories = (sweetener1.amount / sweetenerWorksheet[sweetener1Value]["gram equivalent (of 1/2 cup)"]) * sweetenerWorksheet[sweetener1Value]["Calories"];
        totalCalories += sweetener1Calories;
    }

    if (sweetener2.amount && sweetenerWorksheet[sweetener2Value] && sweetenerWorksheet[sweetener2Value]["gram equivalent (of 1/2 cup)"] && sweetenerWorksheet[sweetener2Value]["Calories"]) {
        var sweetener2Calories = (sweetener2.amount / sweetenerWorksheet[sweetener2Value]["gram equivalent (of 1/2 cup)"]) * sweetenerWorksheet[sweetener2Value]["Calories"];
        totalCalories += sweetener2Calories;
    }

    if (solidSimulated.amount1 && solidMixInWorksheet[solid1Value] && solidMixInWorksheet[solid1Value]["grams (from cups)"] && solidMixInWorksheet[solid1Value]["Calories"]) {
        var solid1Calories = (solidSimulated.amount1 / solidMixInWorksheet[solid1Value]["grams (from cups)"]) * solidMixInWorksheet[solid1Value]["Calories"];
        totalCalories += solid1Calories;
    }

    if (solidSimulated.amount2 && solidMixInWorksheet[solid2Value] && solidMixInWorksheet[solid2Value]["grams (from cups)"] && solidMixInWorksheet[solid2Value]["Calories"]) {
        var solid2Calories = (solidSimulated.amount2 / solidMixInWorksheet[solid2Value]["grams (from cups)"]) * solidMixInWorksheet[solid2Value]["Calories"];
        totalCalories += solid2Calories;
    }

    if (milkType1Grams && milkWorksheet[milk1Value] && milkWorksheet[milk1Value]["Calories"]) {
        var milk1Calories = (milkType1Grams / 240) * milkWorksheet[milk1Value]["Calories"];
        totalCalories += milk1Calories;
    }

    if (milkType2Grams && milkWorksheet[milk2Value] && milkWorksheet[milk2Value]["Calories"]) {
        var milk2Calories = (milkType2Grams / 240) * milkWorksheet[milk2Value]["Calories"];
        totalCalories += milk2Calories;
    }
    // Function to update nutrition facts function 
    document.getElementById('serving-per-container').textContent = `Servings Per Container: ${(sizeSpecsDict[size].Amount/130).toFixed(0)}`; 
    document.getElementById('serving-size').textContent = 'Serving Size: 2/3 cup (130g)';
    document.getElementById('calories').textContent = `Calories: ${(totalCalories * (130/sizeSpecsDict[size].Amount)).toFixed(0)} | ${totalCalories.toFixed(0)}`;
    calculateTotalCalories("Fat (g)","Fat (g)", size, thickener, thickenerValue, liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet);
    calculateTotalCalories("Protein (g)","Protein (g)", size, thickener, thickenerValue, liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet);
    calculateTotalCalories("Total Sugar (g)","Sugar (g)", size, thickener, thickenerValue, liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet);
    calculateTotalCalories("Sugar in Liquid (g)","Sugar (g)", size, thickener, thickenerValue, liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, 0, 0, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet);

    
    if(lactaseDrops == 0){
        calculateTotalCalories("Lactose (g)", "Lactose (g)", size, thickener, thickenerValue, liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet);
    }else{
        addOrUpdateNutritionItem("Lactose (g)",0,0);
    }
    
    //document.getElementById('developerMode-Amounts').innerHTML = gramAmountsDevMode;

    var currentAdditionalCosts = (sizeSpecsDict[size].AdditionalCost + sizeSpecsDict[size].ContainerCost) * upcharge;
    document.getElementById("additionalCosts").innerText = `$${currentAdditionalCosts.toFixed(2)}`;

    var thickenerPrice = thickener.price || 0;
    var liquidMix1Price = liquidMix1.price || 0;
    var liquidMix2Price = liquidMix2.price || 0;
    var sweetener1Price = sweetener1.price || 0;
    var sweetener2Price = sweetener2.price || 0;
    var mixIn1Price = solidSimulated.price1 || 0;
    var mixIn2Price = solidSimulated.price2 || 0;
    var lactaseDropsCost = lactaseDrops * (lactaseDropsPerGramCost / lactaseDropsPerGram); 

    var pricePerQuantity = milkType1Price + milkType2Price + thickenerPrice + liquidMix1Price + liquidMix2Price + sweetener1Price + sweetener2Price + mixIn1Price + mixIn2Price + currentAdditionalCosts + lactaseDropsCost;
    document.getElementById("pricePerQuantity").innerText = `$${pricePerQuantity.toFixed(2)}`;

    var quantity = document.getElementById('quantity-customize').value;
    var totalPrice = pricePerQuantity * quantity;
    document.getElementById("totalPrice").innerText = `$${totalPrice.toFixed(2)}`;

    //TODO add nutrition updating here
}

function calculateTotalCalories(customFieldName,fieldName, size, thickener, thickenerValue,liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet) {
    var totalCalories = 0;

    if (thickener.amount && thickenerWorksheet[thickenerValue] && thickenerWorksheet[thickenerValue][fieldName]) {
        var thickenerCalories = (thickener.amount / 15) * thickenerWorksheet[thickenerValue][fieldName];
        totalCalories += thickenerCalories;
    }

    if (liquidMix1.amount && flavorWorksheet[liquidMix1Value] && flavorWorksheet[liquidMix1Value][fieldName]) {
        var liquidMix1Calories = (liquidMix1.amount / 15) * flavorWorksheet[liquidMix1Value][fieldName];
        totalCalories += liquidMix1Calories;
    }

    if (liquidMix2.amount && flavorWorksheet[liquidMix2Value] && flavorWorksheet[liquidMix2Value][fieldName]) {
        var liquidMix2Calories = (liquidMix2.amount / 15) * flavorWorksheet[liquidMix2Value][fieldName];
        totalCalories += liquidMix2Calories;
    }

    if (sweetener1.amount && sweetenerWorksheet[sweetener1Value] && sweetenerWorksheet[sweetener1Value]["gram equivalent (of 1/2 cup)"] && sweetenerWorksheet[sweetener1Value][fieldName]) {
        var sweetener1Calories = (sweetener1.amount / sweetenerWorksheet[sweetener1Value]["gram equivalent (of 1/2 cup)"]) * sweetenerWorksheet[sweetener1Value][fieldName];
        totalCalories += sweetener1Calories;
    }

    if (sweetener2.amount && sweetenerWorksheet[sweetener2Value] && sweetenerWorksheet[sweetener2Value]["gram equivalent (of 1/2 cup)"] && sweetenerWorksheet[sweetener2Value][fieldName]) {
        var sweetener2Calories = (sweetener2.amount / sweetenerWorksheet[sweetener2Value]["gram equivalent (of 1/2 cup)"]) * sweetenerWorksheet[sweetener2Value][fieldName];
        totalCalories += sweetener2Calories;
    }

    if (solidSimulated.amount1 && solidMixInWorksheet[solid1Value] && solidMixInWorksheet[solid1Value]["grams (from cups)"] && solidMixInWorksheet[solid1Value][fieldName]) {
        var solid1Calories = (solidSimulated.amount1 / solidMixInWorksheet[solid1Value]["grams (from cups)"]) * solidMixInWorksheet[solid1Value][fieldName];
        totalCalories += solid1Calories;
    }

    if (solidSimulated.amount2 && solidMixInWorksheet[solid2Value] && solidMixInWorksheet[solid2Value]["grams (from cups)"] && solidMixInWorksheet[solid2Value][fieldName]) {
        var solid2Calories = (solidSimulated.amount2 / solidMixInWorksheet[solid2Value]["grams (from cups)"]) * solidMixInWorksheet[solid2Value][fieldName];
        totalCalories += solid2Calories;
    }

    if (milkType1Grams && milkWorksheet[milk1Value] && milkWorksheet[milk1Value][fieldName]) {
        var milk1Calories = (milkType1Grams / 240) * milkWorksheet[milk1Value][fieldName];
        totalCalories += milk1Calories;
    }

    if (milkType2Grams && milkWorksheet[milk2Value] && milkWorksheet[milk2Value][fieldName]) {
        var milk2Calories = (milkType2Grams / 240) * milkWorksheet[milk2Value][fieldName];
        totalCalories += milk2Calories;
    }

    
    addOrUpdateNutritionItem(customFieldName,((totalCalories * (130/sizeSpecsDict[size].Amount)).toFixed(0)),totalCalories.toFixed(0));
}

// Function to add or update a nutrition item
function addOrUpdateNutritionItem(label, perServing, perContainer) {
    const nutritionLabel = document.querySelector('.nutrition-label');
    const existingItem = Array.from(nutritionLabel.querySelectorAll('.nutrition-item')).find(item => item.querySelector('.label').textContent === label);

    if (existingItem) {
        // Update the existing item
        existingItem.querySelector('.value').innerHTML = `${perServing} | <span class="container-label">${perContainer}</span>`;
    } else {
        // Add a new item
        const newItem = document.createElement('div');
        newItem.classList.add('nutrition-item');
        newItem.innerHTML = `
            <span class="label">${label}</span>
            <span class="value">${perServing} | <span class="container-label">${perContainer}</span></span>
        `;
        nutritionLabel.appendChild(newItem);
    }
}


function calculateCustomizePriceFromFlavor(size,flavor,lactoseCheckbox) {
    var flavorValues = premadeWorksheet[flavor];

    var liquidMix1 = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, flavorValues["Liquid Mix 1"], flavorValues["Liquid Mix 1 Amount (x tbsp)"], size, null,null);
    var liquidMix2 = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, flavorValues["Liquid Mix 2"], flavorValues["Liquid Mix 2 Amount (x tbsp)"], size, null,null);
    var sweetener1 = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, flavorValues["Sweetner Type 1"], flavorValues["Sweetner Type 1 Amount (x 100g)"], size, null,null);
    var sweetener2 = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, flavorValues["Sweetner Type 2"], flavorValues["Sweetner Type 2 Amount (x 100g)"], size, null,null);
    var solidSimulated = calculateSolidPrice(solidMixInWorksheet, solidSpecs, sizeSpecsDict, flavorValues["Solid Mix 1"], flavorValues["Solid Mix Amount (% of all ice cream)"], size, null, flavorValues["Solid Mix 2"], null);

    var totalGramsBeforeMilk = (liquidMix1.thick === "Yes" ? liquidMix1.amount : 0) + (liquidMix2.thick === "Yes" ? liquidMix2.amount : 0) + (solidSimulated.gramsPerCup1 === 0 ? 0 : ((solidSimulated.amount1 / solidSimulated.gramsPerCup1) * 240) ) + (solidSimulated.gramsPerCup2 === 0 ? 0 : ((solidSimulated.amount2 / solidSimulated.gramsPerCup2) * 240) );

    var [milkType1Price,milkType1Grams,milkType1LactoseDrops] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, flavorValues["Milk Type 1 (2/3)"], size, null, 2/3, totalGramsBeforeMilk);
    var [milkType2Price,milkType2Grams,milkType2LactoseDrops] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, flavorValues["Milk Type 2 (1/3)"], size, null, 1/3, totalGramsBeforeMilk);

    var totalMilk = milkType1Grams + milkType2Grams;
    var thickener = calculateSegmentPrice(thickenerWorksheet, thickenerSpecs, sizeSpecsDict, flavorValues["Thickener"], flavorValues["Thickener Amount (x tbsp)"], size, null,totalMilk);
    
    var lactaseDrops = 0;
    if(lactoseCheckbox){
        var lactaseDrops = Math.ceil(milkType1LactoseDrops + milkType2LactoseDrops + thickener.lactaseDrops);
    }
    
    console.log("Additional Costs is ", sizeSpecsDict[size]);
    var currentAdditionalCosts = (sizeSpecsDict[size].AdditionalCost + sizeSpecsDict[size].ContainerCost) * upcharge;

    var thickenerPrice = thickener.price || 0;
    var liquidMix1Price = liquidMix1.price || 0;
    var liquidMix2Price = liquidMix2.price || 0;
    var sweetener1Price = sweetener1.price || 0;
    var sweetener2Price = sweetener2.price || 0;
    var mixIn1Price = solidSimulated.price1 || 0;
    var mixIn2Price = solidSimulated.price2 || 0;

    var lactaseDropsCost = lactaseDrops * (lactaseDropsPerGramCost / lactaseDropsPerGram) * upcharge; 
    var pricePerQuantity = milkType1Price + milkType2Price + thickenerPrice + liquidMix1Price + liquidMix2Price + sweetener1Price + sweetener2Price + mixIn1Price + mixIn2Price + currentAdditionalCosts + lactaseDropsCost;

    return pricePerQuantity.toFixed(2);
}


function autoSelectValues(flavor, worksheet,size,quantity,lactoseFree) { 
    for (var i = 2; i <= Object.keys(worksheet).length; i++) { 
        // Skip header row 
        var flavorCellAddress = `A${i}`; 
        var flavorCell = worksheet[flavorCellAddress]; 
        if (flavorCell && flavorCell.v && flavorCell.v.toLowerCase() === flavor.toLowerCase()) { 
            

            document.getElementById("name").value = flavor;
            document.getElementById("quantity-customize").value = quantity;
            document.getElementById("quantity-customize").value = quantity;

            const milkTypeWorksheet = workbook.Sheets['Milk Types Nutrition Per Cup'];

            document.getElementById("lactoseCheckboxCustomize").checked = lactoseFree;

            // Set the selected size to the element with id "size"
            var sizeElement = document.getElementById("size-customize");
            sizeElement.querySelectorAll('label').forEach(label => {
                var input = label.querySelector('input');
                if (input.value === size) {
                    label.classList.add('active');
                    input.checked = true;
                } else {
                    label.classList.remove('active');
                    input.checked = false;
                }
            });

            setCustomizeValue(premadeWorksheet[flavor]["Milk Type 1 (2/3)"], 'milkType1'); 
            setCustomizeValue(premadeWorksheet[flavor]["Milk Type 2 (1/3)"], 'milkType2'); 

            var milkType1 = document.getElementById("milkType1").value;
            var milkType2 = document.getElementById("milkType2").value;

            const matchingBase = findMatchingIceCreamBase(milkType1, milkType2, milkTypeWorksheet);

            if (matchingBase) {
                document.getElementById('iceCreamBase').value = matchingBase;
            }

            setCustomizeValue(premadeWorksheet[flavor]["Thickener"], 'thickener'); 
            setCustomizeValue(premadeWorksheet[flavor]["Thickener Amount (x tbsp)"], 'thickenerAmount'); 

            setCustomizeValue(premadeWorksheet[flavor]["Liquid Mix 1"], 'liquidMix1'); 
            setCustomizeValue(premadeWorksheet[flavor]["Liquid Mix 1 Amount (x tbsp)"], 'liquidMix1Amount'); 
            setCustomizeValue(premadeWorksheet[flavor]["Liquid Mix 2"], 'liquidMix2'); 
            setCustomizeValue(premadeWorksheet[flavor]["Liquid Mix 2 Amount (x tbsp)"], 'liquidMix2Amount'); 
            setCustomizeValue(premadeWorksheet[flavor]["Solid Mix 1"], 'mixIn1'); 
            setCustomizeValue(premadeWorksheet[flavor]["Solid Mix 2"], 'mixIn2'); 
            setCustomizeValue(premadeWorksheet[flavor]["Solid Mix Amount (% of all ice cream)"], 'mixInAmount'); 
            setCustomizeValue(premadeWorksheet[flavor]["Sweetner Type 1"], 'sweetener1'); 
            setCustomizeValue(premadeWorksheet[flavor]["Sweetner Type 1 Amount (x 100g)"], 'sweetener1Amount'); 
            setCustomizeValue(premadeWorksheet[flavor]["Sweetner Type 2"], 'sweetener2'); 
            setCustomizeValue(premadeWorksheet[flavor]["Sweetner Type 2 Amount (x 100g)"], 'sweetener2Amount'); 
            
            calculateCustomizePrice();
            break; 
        } 
    } 
}

//based on the selected Ice Cream Base, adjusts the milk types
function updateMilkTypes(iceCreamBase) { 
    var milkTypeWorksheet = workbook.Sheets['Milk Types Nutrition Per Cup'];

    var rowIndex = findRowIndex(iceCreamBase,milkTypeWorksheet); 

    if (rowIndex !== -1) { 
        const milkType1 = milkTypeWorksheet[`P${rowIndex}`] ? milkTypeWorksheet[`P${rowIndex}`].v : ''; 
        const milkType2 = milkTypeWorksheet[`Q${rowIndex}`] ? milkTypeWorksheet[`Q${rowIndex}`].v : ''; 
        const thickener = milkTypeWorksheet[`R${rowIndex}`] ? milkTypeWorksheet[`R${rowIndex}`].v : null; 
        const thickenerAmount = milkTypeWorksheet[`S${rowIndex}`] ? milkTypeWorksheet[`S${rowIndex}`].v : null; 
        document.getElementById('milkType1').value = milkType1; 
        document.getElementById('milkType2').value = milkType2; 
        if(thickener !== null){
            document.getElementById('thickener').value = thickener; 
            document.getElementById('thickenerAmount').value = thickenerAmount; 
        }
    } 
} 

function findRowIndex(iceCreamBase,milkTypeWorksheet) { 
    for (let key in milkTypeWorksheet) { 
        if (key.startsWith('O')) { 
            const rowIndex = key.slice(1); 
            if (milkTypeWorksheet[key] && milkTypeWorksheet[key].v === iceCreamBase) { 
                return rowIndex; 
            } 
        } 
    } 
    return -1
}

//Checks if the combination of milk types align with any of the ice cream bases
function updateIceCreamBase() {
    const milkType1 = document.getElementById('milkType1').value;
    const milkType2 = document.getElementById('milkType2').value;
    const milkTypeWorksheet = workbook.Sheets['Milk Types Nutrition Per Cup'];

    const matchingBase = findMatchingIceCreamBase(milkType1, milkType2, milkTypeWorksheet);

    if (matchingBase) {
        document.getElementById('iceCreamBase').value = matchingBase;
    }
}

function findMatchingIceCreamBase(milkType1, milkType2, milkTypeWorksheet) {
    for (let key in milkTypeWorksheet) {
        if (key.startsWith('O')) {
            const rowIndex = key.slice(1);
            const baseMilkType1 = milkTypeWorksheet[`P${rowIndex}`] ? milkTypeWorksheet[`P${rowIndex}`].v : '';
            const baseMilkType2 = milkTypeWorksheet[`Q${rowIndex}`] ? milkTypeWorksheet[`Q${rowIndex}`].v : '';

            if (baseMilkType1 === milkType1 && baseMilkType2 === milkType2) {
                return milkTypeWorksheet[key].v;
            }
        }
    }
    return null;
}

document.getElementById('milkType1').addEventListener('change', updateIceCreamBase);
document.getElementById('milkType2').addEventListener('change', updateIceCreamBase);

// Function to populate select options from the specified column in the specified sheet 
function populateOptions(sheetName, columnLetter, selectIds) { 
    var worksheet = workbook.Sheets[sheetName]; 
    selectIds.forEach(selectId => { 
        var selectElement = document.getElementById(selectId); 
        selectElement.innerHTML = ''; // Clear existing options 

        if (selectId === 'size-customize') {
            // Handle size options as buttons
            var sizeOptions = [];
            for (var i = 2; i <= Object.keys(worksheet).length; i++) { // Skip header row 
                var cellAddress = `${columnLetter}${i}`; 
                var cell = worksheet[cellAddress]; 
                if (cell && cell.v) { 
                    if(!cell.v.startsWith("_")){
                    sizeOptions.push(cell.v);
                    }
                }
            }

            sizeOptions.forEach(optionValue => {
                var label = document.createElement('label');
                label.className = 'btn btn-outline-primary';
                label.innerHTML = `
                    <input type="radio" name="size" value="${optionValue}" onchange="calculateCustomizePrice()"> ${optionValue}`;
                selectElement.appendChild(label);
            });

            // Set the first option as active by default
            if (sizeOptions.length > 0) {
                selectElement.firstChild.classList.add('active');
                selectElement.firstChild.querySelector('input').checked = true;
            }
        } else {
            // Handle other options as <select> elements
            // Add a default empty option 
            var defaultOption = document.createElement('option'); 
            defaultOption.text = 'Select an option'; 
            defaultOption.value = ''; 
            defaultOption.disabled = true; 
            defaultOption.selected = true; 
            selectElement.add(defaultOption);

            for (var i = 2; i <= Object.keys(worksheet).length; i++) { // Skip header row 
                var cellAddress = `${columnLetter}${i}`; 
                var cell = worksheet[cellAddress]; 
                if (cell && cell.v) { 
                    var cellValue = cell.v; 
                    var option = document.createElement('option'); 
                    option.text = cellValue;

                    // Find the corresponding price 
                    var priceCellAddress = `F${i}`; // Assuming the price is in column B 
                    var priceCell = worksheet[priceCellAddress]; 
                    if (priceCell && priceCell.v) { 
                        option.title = `Cost Per Amount: $${priceCell.v}`; // Set the tooltip with the price 
                    }

                    if (option.text.startsWith("_")) {
                        // Add a spacer option
                        var spacerOption = document.createElement('option'); 
                        spacerOption.text = '---'; // You can customize the spacer text 
                        spacerOption.disabled = true; // Make it non-selectable 
                        selectElement.add(spacerOption);

                        option.text = cellValue.substring(1);
                        option.style.fontWeight = 'bold'
                        option.disabled = true; // Make it non-selectable 
                    } 
                    selectElement.add(option); 
                } 
            } 
        }
    }); 
}

function populateOptionsFromList(dictionary,selectIds){

    selectIds.forEach(selectId => { 
        var selectElement = document.getElementById(selectId); 
        selectElement.innerHTML = ''; // Clear existing options 

        // Handle other options as <select> elements
        // Add a default empty option 
        var defaultOption = document.createElement('option'); 
        defaultOption.text = 'Select an option'; 
        defaultOption.value = ''; 
        defaultOption.disabled = true; 
        defaultOption.selected = true; 
        selectElement.add(defaultOption);

        for (let key in dictionary) { // Skip header row  
            var option = document.createElement('option'); 
            option.text = key;

            option.title = `Cost Per Amount: $${dictionary[key]["Cost ($)"]}`; // Set the tooltip with the price 

            if (key.startsWith("_")) {
                // Add a spacer option
                var spacerOption = document.createElement('option'); 
                spacerOption.text = '---'; // You can customize the spacer text 
                spacerOption.disabled = true; // Make it non-selectable 
                selectElement.add(spacerOption);

                option.text = key.substring(1);
                option.style.fontWeight = 'bold'
                option.disabled = true; // Make it non-selectable 
            } 
            selectElement.add(option); 
        } 
    }); 
}

function fillSpecsDictionary(worksheet, keyColumn, valueColumn, dictionary) {
    for (var i = 2; i <= Object.keys(worksheet).length; i++) {
        var keyCellAddress = `${keyColumn}${i}`;
        var keyCell = worksheet[keyCellAddress];
        if (keyCell && keyCell.v) {
            var key = keyCell.v;
            var valueCellAddress = `${valueColumn}${i}`;
            var value = worksheet[valueCellAddress] ? worksheet[valueCellAddress].v : 0;
            dictionary[key] = value;
        }
    }
}

// calculate custom price updates
document.querySelector('#customizeForm').addEventListener('change', function(event) {
    if (event.target.matches('input, select, button')) {
        calculateCustomizePrice();
    }
});

document.querySelector('#size-customize').addEventListener('change', function(event) {
    if (event.target.matches('input[type="radio"], input, select, button')) {
        calculateCustomizePrice();
    }
});

document.querySelector('#quantity-customize').addEventListener('change', function(event) {
    calculateCustomizePrice();
});

function worksheetToDict(worksheetName) {
    worksheet = workbook.Sheets[worksheetName];

    let result = {};
    let range = XLSX.utils.decode_range(worksheet['!ref']);
    let firstRow = range.s.r;
    let firstCol = range.s.c;

    // Get the headers from the first row
    let headers = [];
    for (let col = firstCol + 1; col <= range.e.c; col++) {
        let cell = worksheet[XLSX.utils.encode_cell({r: firstRow, c: col})];
        if (cell && cell.v) {
            headers.push(cell.v);
        } else {
            break;
        }
    }

    // Iterate through each row and create the dictionary
    for (let row = firstRow + 1; row <= range.e.r; row++) {
        let keyCell = worksheet[XLSX.utils.encode_cell({r: row, c: firstCol})];
        if (keyCell && keyCell.v && !keyCell.v.startsWith("__")) {
            let key = keyCell.v;
            result[key] = {};
            for (let col = firstCol + 1; col <= range.e.c; col++) {
                let header = headers[col - firstCol - 1];
                if (header) {
                    let cell = worksheet[XLSX.utils.encode_cell({r: row, c: col})];
                    result[key][header] = (cell && typeof cell.v === 'string') ? cell.v.trim() : (cell ? cell.v : null);
                }
            }
        }
    }
    return result;
}



function getFlavorFromURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get('flavor');
}

function saveCart() {
    const cartItems = document.querySelectorAll('#cart-items .cart-item');
    const cartData = [];

    cartItems.forEach(item => {
        const itemData = {
            id: item.id,
            name: item.querySelector('.cart-item-name').textContent,
            price: item.querySelector('.cart-item-price').textContent,
            iceCreamBase: item.querySelector('.ice-cream-base').textContent,
            milkType1: item.querySelector('.milk-type1').textContent,
            milkType1Grams: item.querySelector('.milk-type1-grams').textContent,
            milkType2: item.querySelector('.milk-type2').textContent,
            milkType2Grams: item.querySelector('.milk-type2-grams').textContent,
            thickener: item.querySelector('.thickener').textContent,
            thickenerAmount: item.querySelector('.thickener-amount').textContent,
            thickenerGrams: item.querySelector('.thickener-grams').textContent,
            liquidMix1: item.querySelector('.liquid-mix1').textContent,
            liquidMix1Amount: item.querySelector('.liquid-mix1-amount').textContent,
            liquidMix1Grams: item.querySelector('.liquid-mix1-grams').textContent,
            liquidMix2: item.querySelector('.liquid-mix2').textContent,
            liquidMix2Amount: item.querySelector('.liquid-mix2-amount').textContent,
            liquidMix2Grams: item.querySelector('.liquid-mix2-grams').textContent,
            mixIn1: item.querySelector('.mix-in1').textContent,
            mixIn1Grams: item.querySelector('.mix-in1-grams').textContent,
            mixIn2: item.querySelector('.mix-in2').textContent,
            mixIn2Grams: item.querySelector('.mix-in2-grams').textContent,
            mixInAmount: item.querySelector('.mix-in-amount').textContent,
            sweetener1: item.querySelector('.sweetener1').textContent,
            sweetener1Amount: item.querySelector('.sweetener1-amount').textContent,
            sweetener1Grams: item.querySelector('.sweetener1-grams').textContent,
            sweetener2: item.querySelector('.sweetener2').textContent,
            sweetener2Amount: item.querySelector('.sweetener2-amount').textContent,
            sweetener2Grams: item.querySelector('.sweetener2-grams').textContent,
            lactoseDropsChecked: item.querySelector('.lactase-drops-checked').textContent,
            lactoseDropsAmount: item.querySelector('.lactase-drops-grams').textContent,
            quantity: item.querySelector('.quantity').value
        };
        cartData.push(itemData);
    });

    localStorage.setItem('cartItems', JSON.stringify(cartData));
}

function loadCart() {
    const cartData = JSON.parse(localStorage.getItem('cartItems'));

    if (cartData && cartData.length > 0) {
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = '';  // Clear existing items

        cartData.forEach(itemData => {
            const template = document.getElementById('cart-item-template');
            const cartItem = template.content.cloneNode(true).querySelector('.cart-item');
            cartItem.id = itemData.id;

            cartItem.querySelector('.cart-item-name').textContent = itemData.name;
            cartItem.querySelector('.cart-item-price').textContent = itemData.price;
            cartItem.querySelector('.ice-cream-base').textContent = itemData.iceCreamBase;
            cartItem.querySelector('.milk-type1').textContent = itemData.milkType1;
            cartItem.querySelector('.milk-type1-grams').textContent = itemData.milkType1Grams;
            cartItem.querySelector('.milk-type2').textContent = itemData.milkType2;
            cartItem.querySelector('.milk-type2-grams').textContent = itemData.milkType2Grams;
            cartItem.querySelector('.thickener').textContent = itemData.thickener;
            cartItem.querySelector('.thickener-amount').textContent = itemData.thickenerAmount;
            cartItem.querySelector('.thickener-grams').textContent = itemData.thickenerGrams;
            cartItem.querySelector('.liquid-mix1').textContent = itemData.liquidMix1;
            cartItem.querySelector('.liquid-mix1-amount').textContent = itemData.liquidMix1Amount;
            cartItem.querySelector('.liquid-mix1-grams').textContent = itemData.liquidMix1Grams;
            cartItem.querySelector('.liquid-mix2').textContent = itemData.liquidMix2;
            cartItem.querySelector('.liquid-mix2-amount').textContent = itemData.liquidMix2Amount;
            cartItem.querySelector('.liquid-mix2-grams').textContent = itemData.liquidMix2Grams;
            cartItem.querySelector('.mix-in1').textContent = itemData.mixIn1;
            cartItem.querySelector('.mix-in1-grams').textContent = itemData.mixIn1Grams;
            cartItem.querySelector('.mix-in2').textContent = itemData.mixIn2;
            cartItem.querySelector('.mix-in2-grams').textContent = itemData.mixIn2Grams;
            cartItem.querySelector('.mix-in-amount').textContent = itemData.mixInAmount;
            cartItem.querySelector('.sweetener1').textContent = itemData.sweetener1;
            cartItem.querySelector('.sweetener1-amount').textContent = itemData.sweetener1Amount;
            cartItem.querySelector('.sweetener1-grams').textContent = itemData.sweetener1Grams;
            cartItem.querySelector('.sweetener2').textContent = itemData.sweetener2;
            cartItem.querySelector('.sweetener2-amount').textContent = itemData.sweetener2Amount;
            cartItem.querySelector('.sweetener2-grams').textContent = itemData.sweetener2Grams;
            cartItem.querySelector('.lactase-drops-checked').textContent = itemData.lactoseDropsChecked;
            cartItem.querySelector('.lactase-drops-grams').textContent = itemData.lactoseDropsAmount;
            cartItem.querySelector('.quantity').value = itemData.quantity;

            cartItemsContainer.appendChild(cartItem);

        });

        updateTotalPrice();
        toggleCart();
    }
}

function returnToMain() {
    // Restore the main content and hide the Thank You message
    document.getElementById("thank-you-container").style.display = "none";
    document.getElementById("main-content").style.display = "block";
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    document.getElementById("thank-you-container").style.display = "none";

    var flavorUrl = getFlavorFromURL();

    // retrieve the workbook data
    fetch('docs/Ice-Cream-Master-Document.json') // Adjust URL as needed 
    //fetch('docs/Ice-Cream-Master-Document.xlsm') // Adjust URL as needed 
    .then(response => response.text())
    //.then(response => response.arrayBuffer()) // Use arrayBuffer() to handle binary data
    .then(data => {
        
        //const byteArray = new Uint8Array(data);
        const byteArray = new Uint8Array(data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        workbook = XLSX.read(byteArray, { type: 'array'   });

        milkWorksheet = worksheetToDict("Milk Types Nutrition Per Cup");
        thickenerWorksheet = worksheetToDict("Thickener Nutrition");
        flavorWorksheet = worksheetToDict("Liquid Mix In Nutrition");
        solidMixInWorksheet = worksheetToDict("Solid Mix In Nutrition");
        sweetenerWorksheet = worksheetToDict("Sweetener Mix In Nutrition");
        premadeWorksheet = worksheetToDict("Premade Flavors");

        // setup sizeSpecsDict

        //Get spec amounts for storage with future parts
        var specsWorksheet = workbook.Sheets["Specs"];
        for (var i = 2; i <= Object.keys(specsWorksheet).length; i++) { 
            var sizeCellAddress = `A${i}`; 
            var sizeCell = specsWorksheet[sizeCellAddress];
             if (sizeCell && sizeCell.v) { 
                var size = sizeCell.v; 
                var amountCellAddress = `B${i}`; 
                var multiplierCellAddress = `C${i}`;
                var containerCostCellAddress = `V${i}`; 
                var additionalCostCellAddress = `Q${i}`; 

                var amount = specsWorksheet[amountCellAddress] ? specsWorksheet[amountCellAddress].v : 0;
                var multiplier = specsWorksheet[multiplierCellAddress] ? specsWorksheet[multiplierCellAddress].v : 0; 
                var containerCost = specsWorksheet[containerCostCellAddress] ? specsWorksheet[containerCostCellAddress].v : 0; 
                var additionalCost = specsWorksheet[additionalCostCellAddress] ? specsWorksheet[additionalCostCellAddress].v : 0; 

                sizeSpecsDict[size] = { "Amount": amount, "Multiplier": multiplier, "ContainerCost": containerCost, "AdditionalCost": additionalCost }; 
            } 
        }

        additionalCosts = specsWorksheet['Q2'] ? specsWorksheet['Q2'].v : 0;
        upcharge = specsWorksheet['N2'] ? specsWorksheet['N2'].v : 0; 
        address = specsWorksheet['L1'] ? specsWorksheet['L1'].v : 0; 
        gallonCost = specsWorksheet['L2'] ? specsWorksheet['L2'].v : 0; 
        carMpg = specsWorksheet['L3'] ? specsWorksheet['L3'].v : 0; 
        lactaseDropsPerGram = specsWorksheet['AA3'] ? specsWorksheet['AA3'].v : 0; 
        lactaseDropsPerGramCost = specsWorksheet['Z3'] ? specsWorksheet['Z3'].v : 0; 

        fillSpecsDictionary(specsWorksheet, 'D', 'E', liquidSpecs);
        fillSpecsDictionary(specsWorksheet, 'W', 'X', thickenerSpecs);
        fillSpecsDictionary(specsWorksheet, 'H', 'I', solidSpecs);
        fillSpecsDictionary(specsWorksheet, 'F', 'G', sweetenerSpecs);

        // populate drop downs for all the different areas (Used in Customize menus)
        populateOptions('Milk Types Nutrition Per Cup', "O", ['iceCreamBase']); 

        populateOptionsFromList(milkWorksheet,['milkType1', 'milkType2']);
        populateOptionsFromList(thickenerWorksheet,['thickener']);
        populateOptionsFromList(flavorWorksheet,['liquidMix1', 'liquidMix2']);
        populateOptionsFromList(solidMixInWorksheet,['mixIn1', 'mixIn2']);
        populateOptionsFromList(sweetenerWorksheet,['sweetener1', 'sweetener2']);

        populateOptions('Specs', "A", ['size-customize']); 
        populateOptions('Specs', "D", ['liquidMix1Amount','liquidMix2Amount']); 
        populateOptions('Specs', "W", ['thickenerAmount']); 
        populateOptions('Specs', "F", ['sweetener1Amount','sweetener2Amount']); 
        populateOptions('Specs', "H", ['mixInAmount']);     

        // Populate all the flavors on then website
        populateFlavorCards('Premade Flavors');  

        if (flavorUrl) {
            openFlavorModal(flavorUrl);

            //addToCart(flavorUrl,premadeWorksheet, 1, calculateCustomizePriceFromFlavor(sizeOptions[0],flavorUrl), sizeOptions[0],false); 
            let baseUrl = window.location.origin + window.location.pathname;
            window.history.replaceState(null, '', baseUrl);
        }
    });      
});

document.getElementById('darkModeToggle').addEventListener('click', function() {
    // Check the user's preference and apply dark mode if enabled
    const userPreference = localStorage.getItem('darkMode');
    if (userPreference === 'enabled') {
        document.body.classList.add('dark-mode');
    } else if (userPreference === 'disabled') {
        document.body.classList.remove('dark-mode');
    } else if (isNightTime()) {
        // Automatically enable dark mode if it's nighttime and no user preference is set
        document.body.classList.add('dark-mode');
    }
});

function isNightTime() {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 18 || hours < 6; // Nighttime is between 6 PM and 6 AM
}

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

// Automatically enable dark mode if it's nighttime
if (isNightTime()) {
    document.body.classList.add('dark-mode');
}

// Checkout Modal Stuff
function checkout() {
    // Get the total price from the shopping cart
    let totalPrice = parseFloat($('#total-price').text());

    // Set the final cost in the checkout modal
    $('#finalCost').text(totalPrice.toFixed(2));
    $('#deliveryCost').text("$0.00");

    // Clear the existing order summary
    $('#orderSummary ul').empty();
    $('#hiddenOrderSummary ul').empty();
    var sampleSizeCount = 0;
    var nonSampleSizeCount = 0;
    // Loop through the cart items and add them to the order summary
    $('#cart-items .cart-item').each(function () {
        let itemName = $(this).find('.cart-item-name').text();
        console.log("item name is ",itemName);
        let size = itemName.split('-').pop().trim();
        
        let itemPrice = parseFloat($(this).find('.cart-item-price').text().replace('$', ''));
        let itemQuantity = $(this).find('.quantity').val();
        let ingredientsTable = $(this).find('table').clone();
        console.log("size is ",size);

        if(size == "Sample"){
            console.log("item quantity is ",itemQuantity);
            sampleSizeCount = sampleSizeCount + (1*itemQuantity);
        }else{
            nonSampleSizeCount = nonSampleSizeCount + 1;
        }
        // Append the item to the order summary
        $('#orderSummary ul').append(`<li>${itemQuantity} x ${itemName} - $${(itemPrice * itemQuantity).toFixed(2)}</li>`);
        $('#hiddenOrderSummary ul').append(`<li>${itemQuantity} x ${itemName} - $${(itemPrice * itemQuantity).toFixed(2)}</li>`);

        // Extract text content from the ingredients table

        let hiddenOrderSummary = '';

        let condensedTableText = '';
        let excludeColumnIndex = -1;

        // Process the header and body rows together
        ingredientsTable.find('tr').each(function () {
            let rowText = '';
            let hiddenRowText = '';
            $(this).find('th, td').each(function (index) {
                if ($(this).prop('tagName') === 'TH' && $(this).text().includes('Grams')) {
                    excludeColumnIndex = index;
                } else if (index !== excludeColumnIndex) {
                    rowText += `${$(this).text()} | `;
                }
                hiddenRowText += `${$(this).text()} | `;
            });
            hiddenOrderSummary += hiddenRowText.slice(0, -3) + '\n'; // Remove the last separator and add a new line
            condensedTableText += rowText.slice(0, -3) + '\n'; // Remove the last separator and add a new line
        });


        

        // Append the hidden Grams value at the end of the condensed table text



        // Append the condensed table text to the order summary
        
        $('#hiddenOrderSummary ul').append(`<li style="margin-left: 20px; white-space: pre-wrap;">${hiddenOrderSummary}</li>`);
        //TODO only for testing
        $('#orderSummary ul').append(`<li style="margin-left: 20px; white-space: pre-wrap;">${condensedTableText}</li>`);
        //$('#orderSummary ul').append(`<li style="margin-left: 20px; white-space: pre-wrap;">${hiddenOrderSummary}</li>`);


    });
    console.log("sample size count is ", sampleSizeCount);
    console.log("non sample size count is ", sampleSizeCount);
    if (sampleSizeCount >= 1 && sampleSizeCount < 4 && nonSampleSizeCount == 0) {
        // Display an error message or handle the error
        alert(`You need to add ${4 - sampleSizeCount} more sample(s) or add a larger size ice cream!`);
    }else{
        // Show the checkout modal
        $('#checkoutModal').modal('show');
    }
    
}


function submitCheckout(event) {
    event.preventDefault(); // Prevent the default form submission

    // Check if the delivery cost contains "Pending"
    const deliveryCost = $('#deliveryCost').text().trim();
    if (deliveryCost.includes("Pending")) {
        alert('Please wait until the delivery cost is confirmed before submitting your order.');
        return; // Stop the form submission
    }

    const totalCost = $('#finalCost').text().trim();


    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);

    // Manually add the order summary to the FormData object
    let orderSummary = '';
    $('#hiddenOrderSummary ul li').each(function() {
        orderSummary += $(this).text() + '\n';
    });

    formData.append('orderSummary', orderSummary);
    formData.append('deliveryCost',deliveryCost);
    formData.append('finalCost',totalCost);

    

    
    fetch('https://formspree.io/f/xlddapjp', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            form.reset(); // Reset the form after successful submission
            $('#checkoutModal').modal('hide');
            // Hide main content and show the Thank You message
            document.getElementById("main-content").style.display = "none";
            document.getElementById("thank-you-container").style.display = "block";
        } else {
            alert('Oops! There was a problem with your submission.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Oops! There was a problem with your submission.');
    });
    
}

document.getElementById('deliveryOption').addEventListener('change', function() {
    var addressFields = document.getElementById('addressFields');
    if (this.value === 'delivery') {
        addressFields.style.display = 'block';
        document.getElementById('address1').required = true;
        document.getElementById('city').required = true;
        document.getElementById('state').required = true;
        document.getElementById('zip').required = true;
    } else {
        addressFields.style.display = 'none';
        document.getElementById('address1').required = false;
        document.getElementById('city').required = false;
        document.getElementById('state').required = false;
        document.getElementById('zip').required = false;
    }
});

// Attach the submit event listener to the form
document.getElementById('checkoutForm').addEventListener('submit', submitCheckout);

document.getElementById('deliveryOption').addEventListener('change', function() {
    var addressFields = document.getElementById('addressFields');
    if (this.value === 'delivery') {
        addressFields.style.display = 'block';
    } else {
        addressFields.style.display = 'none';
    }
});

var addressInputs = document.querySelectorAll('#address1, #address2, #city, #state, #zip');
addressInputs.forEach(function(input) {
    input.addEventListener('blur', function() {
        var address1 = document.getElementById('address1').value;
        var address2 = document.getElementById('address2').value;
        var city = document.getElementById('city').value;
        var state = document.getElementById('state').value;
        var zip = document.getElementById('zip').value;
        if (address1 && city && state && zip) {
            var destination = address1 + ' ' + address2 + ', ' + city + ', ' + state + ' ' + zip;
            calculateDeliveryCost(destination);
        }
    });
});

function geocodeAddress(address, callback) {
    var apiKey = '5b3ce3597851110001cf62483004d26df1dd45f3bbb304bd8308b847';
    var url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                var coordinates = data.features[0].geometry.coordinates;
                callback(null, coordinates);
            } else {
                callback('Error: No results found for the address');
            }
        })
        .catch(error => {
            callback('Error in geocoding: ' + error);
        });
}

function calculateDeliveryCost(destination) {

    document.getElementById('deliveryCost').textContent = "Pending...";

    geocodeAddress(address, function(error, originCoordinates) {
        if (error) {
            console.error(error);
            return;
        }

        geocodeAddress(destination, function(error, destinationCoordinates) {
            if (error) {
                console.error(error);
                return;
            }

            var apiKey = '5b3ce3597851110001cf62483004d26df1dd45f3bbb304bd8308b847';
            var url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${originCoordinates.join(',')}&end=${destinationCoordinates.join(',')}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.features && data.features.length > 0) {
                        var distance = data.features[0].properties.segments[0].distance;
                        var deliveryCost = (((distance / 1609.34) / carMpg) * gallonCost) * 2; // Convert meters to miles and calculate cost
                        //console.log("Delivery cost is ", deliveryCost)
                        document.getElementById('deliveryCost').textContent = '$' + deliveryCost.toFixed(2);
                        let totalPrice = parseFloat($('#total-price').text());
                        totalPrice = totalPrice + deliveryCost;
                        $('#finalCost').text("$" + totalPrice.toFixed(2));

                    } else {
                        console.error('Error in else:', data);
                    }
                })
                .catch(error => {
                    console.error('Error in catch:', error);
                });
        });
    });
}
