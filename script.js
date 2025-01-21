let workbook;
let additionalCosts;
let upcharge;

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
        const totalPrice = document.getElementById('totalPrice').textContent;

        // Create a cart item using the template
        const template = document.getElementById('cart-item-template');
        const cartItem = template.content.cloneNode(true).querySelector('.cart-item');
        cartItem.id = cartItemId || `cart-item-${Date.now()}`;

        // Update the cart item with the selected values
        cartItem.querySelector('.cart-item-name').textContent = `${name} - ${size}`;
        cartItem.querySelector('.ice-cream-base').textContent = iceCreamBase;
        cartItem.querySelector('.milk-type1').textContent = milkType1;
        cartItem.querySelector('.milk-type2').textContent = milkType2;
        cartItem.querySelector('.thickener').textContent = thickener;
        cartItem.querySelector('.thickener-amount').textContent = thickenerAmount;
        cartItem.querySelector('.liquid-mix1').textContent = liquidMix1;
        cartItem.querySelector('.liquid-mix1-amount').textContent = liquidMix1Amount;
        cartItem.querySelector('.liquid-mix2').textContent = liquidMix2;
        cartItem.querySelector('.liquid-mix2-amount').textContent = liquidMix2Amount;
        cartItem.querySelector('.mix-in1').textContent = mixIn1;
        cartItem.querySelector('.mix-in2').textContent = mixIn2;
        cartItem.querySelector('.mix-in-amount').textContent = mixInAmount;
        cartItem.querySelector('.sweetener1').textContent = sweetener1;
        cartItem.querySelector('.sweetener1-amount').textContent = sweetener1Amount;
        cartItem.querySelector('.sweetener2').textContent = sweetener2;
        cartItem.querySelector('.sweetener2-amount').textContent = sweetener2Amount;
        console.log("Setting quantity to ", quantity);
        cartItem.querySelector('.quantity').value = quantity;
        cartItem.querySelector('.cart-item-price').textContent = `${totalPrice}`;

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
        console.log("Quantity is: ", quantity);
        const price = parseFloat(cartItem.querySelector('.cart-item-price').textContent.replace('$', ''));
        console.log("Price is: ", price);
        totalPrice += quantity * price;
    });

    console.log("Total price is now : ", totalPrice);

    // Update the total price element
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
}


function editCartItem(button) { 

    cartItem = button.closest('.cart-item');

    cartItemId = cartItem.id;

    console.log("Cart item ID is ", cartItemId);
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
    document.getElementById('size-customize').value = size;
    document.getElementById('quantity-customize').value = quantity;

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
        if (cell && cell.v) { 
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

            if (flavor.startsWith('_')) {
                if (flavor.includes("FEATURED:")) {
                        // Create a new featured group header
                        featuredGroup = document.createElement('div'); 
                        featuredGroup.className = 'row flavor-group featured-group'; 

                        // Create a sticky header
                        var header = document.createElement('div');
                        header.className = 'sticky-header';
                        header.innerHTML = `<h3 class="col-12">${flavor.replace("FEATURED:", "").trim().substring(1)}</h3>`;
                        featuredGroup.appendChild(header);

                        flavorCardsContainer.insertAdjacentElement('afterbegin', featuredGroup);
                    }
                    else {
                    // Create a new group header
                    featuredGroup = null;
                    currentGroup = document.createElement('div'); 
                    currentGroup.className = 'row flavor-group'; 

                    // Create a sticky header
                    var header = document.createElement('div');
                    header.className = 'sticky-header';
                    header.innerHTML = `<h3 class="col-12">${flavor.substring(1)}</h3>`;
                    currentGroup.appendChild(header);

                    flavorCardsContainer.appendChild(currentGroup);
                }

            } else {
                if (priceCell && priceCell.v && imageCell && imageCell.v) { 
                    var price = calculateCustomizePriceFromFlavor(sizeOptions[0],flavor);
                    var imageUrl = `images/${imageCell.v}.png`;

                    // Clone the template
                    var template = document.getElementById('flavor-card-template');
                    var clone = template.content.cloneNode(true);

                    // Populate the clone with data
                    clone.querySelector('.card-img-top').src = imageUrl;
                    clone.querySelector('.card-img-top').alt = flavor;
                    clone.querySelector('.card-title').textContent = flavor;
                    clone.querySelector('.card-price').textContent = `$${price}`;

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

                        if (index === 0) { 
                            input.checked = true; // Set the first button as active by default 
                            label.classList.add('active', 'focus'); // Add the "active" and "focus" classes to the first label
                        }
                        // Append the input element to the label 
                        label.appendChild(input);

                        sizeElement.appendChild(label);
                    });

                    clone.querySelector('#size-flavor').innerHTML = sizeElement.innerHTML;
                    clone.querySelector('.form-control').id = `quantity-${flavor.toLowerCase()}`;
                    clone.querySelector('.add-to-cart').setAttribute('data-flavor', flavor);
                    clone.querySelector('.customize-btn').setAttribute('data-flavor', flavor);

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

    // Add event listener for size buttons using document.querySelectorAll
    document.querySelectorAll('input[name^="size-flavor-"]').forEach(input => {
        input.addEventListener('change', function() {
            var flavor = this.name.split('-')[2];
            var newSize = this.value;
            var newPrice = calculateCustomizePriceFromFlavor(newSize, flavor);
            this.closest('.card-body').querySelector('.card-price').textContent = `$${newPrice}`;
        });
    });

    // Add event listener for label class changes
    document.querySelectorAll('label[for^="size-flavor-"]').forEach(label => {
        label.addEventListener('click', function() {
            setTimeout(() => {
                if (this.classList.contains('active')) {
                    var parts = this.getAttribute('for').split('-'); 
                    var flavor = parts.slice(2, -1).join('-'); 
                    var newSize = parts[parts.length - 1];
                    var newPrice = calculateCustomizePriceFromFlavor(newSize, flavor);
                    this.closest('.card-body').querySelector('.card-price').textContent = `$${newPrice}`;
                }
            }, 0);
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

            var quantity = document.getElementById(`quantity-${flavor.toLowerCase()}`).value;
            autoSelectValues(flavor, worksheet, size, quantity); 
        }); 
    });

    // Add event listener for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => { 
        button.addEventListener('click', function() { 
            var flavor = this.getAttribute('data-flavor'); 
            var quantity = this.closest('.card-body').querySelector('.quantity').value;
            var sizeElement = this.closest('.card-body').querySelector('input[name^="size-flavor-"]:checked');
            var size = sizeElement ? sizeElement.value : '';

            var priceElement = this.closest('.card-body').querySelector('.card-price'); 

            addToCart(flavor, premadeWorksheet, quantity, priceElement.innerText, size); 
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

function addToCart(flavor, worksheet, quantity,price,size) {
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

    // Set the values
    cartItem.querySelector('.cart-item').id = uniqueId;
    cartItem.querySelector('.cart-item-name').textContent = `${name} - ${size}`;
    cartItem.querySelector('.ice-cream-base').textContent = iceCreamBase;
    cartItem.querySelector('.milk-type1').textContent = milkType1;
    cartItem.querySelector('.milk-type2').textContent = milkType2;
    cartItem.querySelector('.thickener').textContent = thickener;
    cartItem.querySelector('.thickener-amount').textContent = thickenerAmount;
    cartItem.querySelector('.liquid-mix1').textContent = liquidMix1;
    cartItem.querySelector('.liquid-mix1-amount').textContent = liquidMix1Amount;
    cartItem.querySelector('.liquid-mix2').textContent = liquidMix2;
    cartItem.querySelector('.liquid-mix2-amount').textContent = liquidMix2Amount;
    cartItem.querySelector('.mix-in1').textContent = mixIn1;
    cartItem.querySelector('.mix-in2').textContent = mixIn2;
    cartItem.querySelector('.mix-in-amount').textContent = mixInAmount;
    cartItem.querySelector('.sweetener1').textContent = sweetener1;
    cartItem.querySelector('.sweetener1-amount').textContent = sweetener1Amount;
    cartItem.querySelector('.sweetener2').textContent = sweetener2;
    cartItem.querySelector('.sweetener2-amount').textContent = sweetener2Amount;
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

function calculateSegmentPrice(worksheet, specsDict, sizeSpecsDict, value, amountValue, size, priceId) {
    if (value === '' || amountValue === '' || !worksheet.hasOwnProperty(value)) {
        if (priceId) document.getElementById(priceId).innerText = ``;
        return { amount: 0, price: 0 };
    }

    var amount = (specsDict[amountValue] * sizeSpecsDict[size].Multiplier); 
      
    var cost = worksheet[value]["Cost ($)"];

    var price = amount * cost * upcharge;
    price = price.toFixed(2);
    
    if (priceId) document.getElementById(priceId).innerText = `$${price}`;

    if (worksheet[value].hasOwnProperty("Thick?")) {
        if (worksheet[value]["Thick?"] === "Yes") {
            amount = 0;               
        }
    }

    if (worksheet === flavorWorksheet) {
        amount = amount * 15;
    } else if (worksheet === sweetenerWorksheet) {
        amount = amount * sweetenerWorksheet[value]["gram equivalent (of 1/2 cup)"];
        // TODO: need to use custom gram value when calculating costs
    }

    return { amount: amount, price: parseFloat(price) };
}

function calculateSolidPrice(worksheet, specsDict, sizeSpecsDict, value1, amountValue, size, priceId, value2, price2Id) {
    var splitAmount = 0.5;

    if (value1 === '' || amountValue === '' || !worksheet.hasOwnProperty(value1)) {
        if (priceId) document.getElementById(priceId).innerText = ``;
        if (price2Id) document.getElementById(price2Id).innerText = ``;
        return { cupAmount: 0, price1: 0, price2: 0 };
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
    if (value2 !== '' && worksheet.hasOwnProperty(value2) && worksheet[value2].hasOwnProperty("grams (from cups)")) {
        var value2gramsPerCup = worksheet[value2]["grams (from cups)"];
        value2Grams = cupAmount / 240 * value2gramsPerCup * splitAmount;
        var cost2 = worksheet[value2]["Cost ($)"];
        price2 = (value2Grams / value2gramsPerCup) * upcharge * cost2;
        price2 = price2.toFixed(2);
        if (price2Id) document.getElementById(price2Id).innerText = `$${price2}`;
    }

    return { cupAmount: cupAmount, price1: parseFloat(price1), price2: parseFloat(price2), amount1: value1Grams, amount2:value2Grams };
}

function calculateMilkPrice(worksheet, sizeSpecsDict, value, size, priceId, milkPortion, totalGramsBeforeMilk) {
    if (value === '') {
        if (priceId) document.getElementById(priceId).innerText = ``;
        return [0,0];
    }

    var cost = worksheet[value]["Cost ($)"];
    var grams = (sizeSpecsDict[size].Amount - totalGramsBeforeMilk) * milkPortion;
    var price = (grams / 240) * cost * upcharge;
    price = price.toFixed(2);
    if (priceId) document.getElementById(priceId).innerText = `$${price}`;                   

    return [parseFloat(price),grams];
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
    

    var thickener = calculateSegmentPrice(thickenerWorksheet, liquidSpecs, sizeSpecsDict, thickenerValue, document.getElementById('thickenerAmount').value, size, 'thickenerPrice');
    var liquidMix1 = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix1Value, document.getElementById('liquidMix1Amount').value, size, 'liquidMix1Price');
    var liquidMix2 = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, liquidMix2Value, document.getElementById('liquidMix2Amount').value, size, 'liquidMix2Price');
    var sweetener1 = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener1Value, document.getElementById('sweetener1Amount').value, size, 'sweetener1Price');
    var sweetener2 = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, sweetener2Value, document.getElementById('sweetener2Amount').value, size, 'sweetener2Price');
    var solidSimulated = calculateSolidPrice(solidMixInWorksheet, solidSpecs, sizeSpecsDict, solid1Value, document.getElementById('mixInAmount').value, size, 'mixIn1Price', solid2Value, 'mixIn2Price');

    var totalGramsBeforeMilk = thickener.amount + liquidMix1.amount + liquidMix2.amount + solidSimulated.cupAmount;

    var [milkType1Price,milkType1Grams] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, milk1Value, size, 'milkType1Price', 2/3, totalGramsBeforeMilk);
    var [milkType2Price,milkType2Grams] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, milk2Value, size, 'milkType2Price', 1/3, totalGramsBeforeMilk);

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
    document.getElementById('serving-per-container').textContent = `Servings Per Container: ${(sizeSpecsDict[size].Amount/66).toFixed(0)}`; 
    document.getElementById('serving-size').textContent = 'Serving Size: 1/2 cup (66g)';
    document.getElementById('calories').textContent = `Calories: ${(totalCalories * (66/sizeSpecsDict[size].Amount)).toFixed(0)} | ${totalCalories.toFixed(0)}`;
    calculateTotalCalories("Fat (g)", size, thickener, thickenerValue, liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet);
    calculateTotalCalories("Protein (g)", size, thickener, thickenerValue, liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet);
    calculateTotalCalories("Sugar (g)", size, thickener, thickenerValue, liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet);


    var currentAdditionalCosts = (additionalCosts + sizeSpecsDict[size].ContainerCost) * upcharge;
    document.getElementById("additionalCosts").innerText = `$${currentAdditionalCosts.toFixed(2)}`;

    var thickenerPrice = thickener.price || 0;
    var liquidMix1Price = liquidMix1.price || 0;
    var liquidMix2Price = liquidMix2.price || 0;
    var sweetener1Price = sweetener1.price || 0;
    var sweetener2Price = sweetener2.price || 0;
    var mixIn1Price = solidSimulated.price1 || 0;
    var mixIn2Price = solidSimulated.price2 || 0;

    var pricePerQuantity = milkType1Price + milkType2Price + thickenerPrice + liquidMix1Price + liquidMix2Price + sweetener1Price + sweetener2Price + mixIn1Price + mixIn2Price + currentAdditionalCosts;
    document.getElementById("pricePerQuantity").innerText = `$${pricePerQuantity.toFixed(2)}`;

    var quantity = document.getElementById('quantity-customize').value;
    var totalPrice = pricePerQuantity * quantity;
    document.getElementById("totalPrice").innerText = `$${totalPrice.toFixed(2)}`;

    //TODO add nutrition updating here
}

function calculateTotalCalories(fieldName, size, thickener, thickenerValue,liquidMix1, liquidMix1Value, liquidMix2, liquidMix2Value, sweetener1, sweetener1Value, sweetener2, sweetener2Value, solidSimulated, solid1Value, solid2Value, milkType1Grams, milk1Value, milkType2Grams, milk2Value, flavorWorksheet, sweetenerWorksheet, solidMixInWorksheet, milkWorksheet) {
    var totalCalories = 0;

    if (thickener.amount && flavorWorksheet[thickenerValue] && flavorWorksheet[thickenerValue][fieldName]) {
        var thickenerCalories = (thickener.amount / 15) * flavorWorksheet[thickenerValue][fieldName];
        console.log(`Liquid Mix 1: Amount = ${thickener.amount}, ${fieldName} per 15g = ${thickenerWorksheet[thickenerValue][fieldName]}, Calculation = ${thickener.amount} / 15 * ${thickenerWorksheet[thickenerValue][fieldName]}, Result = ${thickenerCalories}`);
        totalCalories += thickenerCalories;
    }


    if (liquidMix1.amount && flavorWorksheet[liquidMix1Value] && flavorWorksheet[liquidMix1Value][fieldName]) {
        var liquidMix1Calories = (liquidMix1.amount / 15) * flavorWorksheet[liquidMix1Value][fieldName];
        console.log(`Liquid Mix 1: Amount = ${liquidMix1.amount}, ${fieldName} per 15g = ${flavorWorksheet[liquidMix1Value][fieldName]}, Calculation = ${liquidMix1.amount} / 15 * ${flavorWorksheet[liquidMix1Value][fieldName]}, Result = ${liquidMix1Calories}`);
        totalCalories += liquidMix1Calories;
    }

    if (liquidMix2.amount && flavorWorksheet[liquidMix2Value] && flavorWorksheet[liquidMix2Value][fieldName]) {
        var liquidMix2Calories = (liquidMix2.amount / 15) * flavorWorksheet[liquidMix2Value][fieldName];
        console.log(`Liquid Mix 2: Amount = ${liquidMix2.amount}, ${fieldName} per 15g = ${flavorWorksheet[liquidMix2Value][fieldName]}, Calculation = ${liquidMix2.amount} / 15 * ${flavorWorksheet[liquidMix2Value][fieldName]}, Result = ${liquidMix2Calories}`);
        totalCalories += liquidMix2Calories;
    }

    if (sweetener1.amount && sweetenerWorksheet[sweetener1Value] && sweetenerWorksheet[sweetener1Value]["gram equivalent (of 1/2 cup)"] && sweetenerWorksheet[sweetener1Value][fieldName]) {
        var sweetener1Calories = (sweetener1.amount / sweetenerWorksheet[sweetener1Value]["gram equivalent (of 1/2 cup)"]) * sweetenerWorksheet[sweetener1Value][fieldName];
        console.log(`Sweetener 1: Amount = ${sweetener1.amount}, Gram Equivalent (of 1/2 cup) = ${sweetenerWorksheet[sweetener1Value]["gram equivalent (of 1/2 cup)"]}, ${fieldName} per Gram Equivalent = ${sweetenerWorksheet[sweetener1Value][fieldName]}, Calculation = ${sweetener1.amount} / ${sweetenerWorksheet[sweetener1Value]["gram equivalent (of 1/2 cup)"]} * ${sweetenerWorksheet[sweetener1Value][fieldName]}, Result = ${sweetener1Calories}`);
        totalCalories += sweetener1Calories;
    }

    if (sweetener2.amount && sweetenerWorksheet[sweetener2Value] && sweetenerWorksheet[sweetener2Value]["gram equivalent (of 1/2 cup)"] && sweetenerWorksheet[sweetener2Value][fieldName]) {
        var sweetener2Calories = (sweetener2.amount / sweetenerWorksheet[sweetener2Value]["gram equivalent (of 1/2 cup)"]) * sweetenerWorksheet[sweetener2Value][fieldName];
        console.log(`Sweetener 2: Amount = ${sweetener2.amount}, Gram Equivalent (of 1/2 cup) = ${sweetenerWorksheet[sweetener2Value]["gram equivalent (of 1/2 cup)"]}, ${fieldName} per Gram Equivalent = ${sweetenerWorksheet[sweetener2Value][fieldName]}, Calculation = ${sweetener2.amount} / ${sweetenerWorksheet[sweetener2Value]["gram equivalent (of 1/2 cup)"]} * ${sweetenerWorksheet[sweetener2Value][fieldName]}, Result = ${sweetener2Calories}`);
        totalCalories += sweetener2Calories;
    }

    if (solidSimulated.amount1 && solidMixInWorksheet[solid1Value] && solidMixInWorksheet[solid1Value]["grams (from cups)"] && solidMixInWorksheet[solid1Value][fieldName]) {
        var solid1Calories = (solidSimulated.amount1 / solidMixInWorksheet[solid1Value]["grams (from cups)"]) * solidMixInWorksheet[solid1Value][fieldName];
        console.log(`Solid Mix In 1: Amount = ${solidSimulated.amount1}, Grams (from cups) = ${solidMixInWorksheet[solid1Value]["grams (from cups)"]}, ${fieldName} per Gram = ${solidMixInWorksheet[solid1Value][fieldName]}, Calculation = ${solidSimulated.amount1} / ${solidMixInWorksheet[solid1Value]["grams (from cups)"]} * ${solidMixInWorksheet[solid1Value][fieldName]}, Result = ${solid1Calories}`);
        totalCalories += solid1Calories;
    }

    if (solidSimulated.amount2 && solidMixInWorksheet[solid2Value] && solidMixInWorksheet[solid2Value]["grams (from cups)"] && solidMixInWorksheet[solid2Value][fieldName]) {
        var solid2Calories = (solidSimulated.amount2 / solidMixInWorksheet[solid2Value]["grams (from cups)"]) * solidMixInWorksheet[solid2Value][fieldName];
        console.log(`Solid Mix In 2: Amount = ${solidSimulated.amount2}, Grams (from cups) = ${solidMixInWorksheet[solid2Value]["grams (from cups)"]}, ${fieldName} per Gram = ${solidMixInWorksheet[solid2Value][fieldName]}, Calculation = ${solidSimulated.amount2} / ${solidMixInWorksheet[solid2Value]["grams (from cups)"]} * ${solidMixInWorksheet[solid2Value][fieldName]}, Result = ${solid2Calories}`);
        totalCalories += solid2Calories;
    }

    if (milkType1Grams && milkWorksheet[milk1Value] && milkWorksheet[milk1Value][fieldName]) {
        var milk1Calories = (milkType1Grams / 240) * milkWorksheet[milk1Value][fieldName];
        console.log(`Milk Type 1: Grams = ${milkType1Grams}, ${fieldName} per 240g = ${milkWorksheet[milk1Value][fieldName]}, Calculation = ${milkType1Grams} / 240 * ${milkWorksheet[milk1Value][fieldName]}, Result = ${milk1Calories}`);
        totalCalories += milk1Calories;
    }

    if (milkType2Grams && milkWorksheet[milk2Value] && milkWorksheet[milk2Value][fieldName]) {
        var milk2Calories = (milkType2Grams / 240) * milkWorksheet[milk2Value][fieldName];
        console.log(`Milk Type 2: Grams = ${milkType2Grams}, ${fieldName} per 240g = ${milkWorksheet[milk2Value][fieldName]}, Calculation = ${milkType2Grams} / 240 * ${milkWorksheet[milk2Value][fieldName]}, Result = ${milk2Calories}`);
        totalCalories += milk2Calories;
    }

    
    addOrUpdateNutritionItem(fieldName,((totalCalories * (66/sizeSpecsDict[size].Amount)).toFixed(0)),totalCalories.toFixed(0));
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


function calculateCustomizePriceFromFlavor(size,flavor) {
    var flavorValues = premadeWorksheet[flavor];

    console.log("Flavor Values is ", flavorValues);

    var thickener = calculateSegmentPrice(thickenerWorksheet, liquidSpecs, sizeSpecsDict, flavorValues["Thickener"], flavorValues["Thickener Amount (x tbsp)"], size, null);
    var liquidMix1 = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, flavorValues["Liquid Mix 1"], flavorValues["Liquid Mix 1 Amount (x tbsp)"], size, null);
    var liquidMix2 = calculateSegmentPrice(flavorWorksheet, liquidSpecs, sizeSpecsDict, flavorValues["Liquid Mix 2"], flavorValues["Liquid Mix 2 Amount (x tbsp)"], size, null);
    var sweetener1 = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, flavorValues["Sweetner Type 1"], flavorValues["Sweetner Type 1 Amount (x 100g)"], size, null);
    var sweetener2 = calculateSegmentPrice(sweetenerWorksheet, sweetenerSpecs, sizeSpecsDict, flavorValues["Sweetner Type 2"], flavorValues["Sweetner Type 2 Amount (x 100g)"], size, null);
    var solidSimulated = calculateSolidPrice(solidMixInWorksheet, solidSpecs, sizeSpecsDict, flavorValues["Solid Mix 1"], flavorValues["Solid Mix Amount (% of all ice cream)"], size, null, flavorValues["Solid Mix 2"], null);

    var totalGramsBeforeMilk = thickener.amount + liquidMix1.amount + liquidMix2.amount + solidSimulated.cupAmount;

    var [milkType1Price,milkType1Grams] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, flavorValues["Milk Type 1 (2/3)"], size, null, 2/3, totalGramsBeforeMilk);
    var [milkType2Price,milkType2Grams] = calculateMilkPrice(milkWorksheet, sizeSpecsDict, flavorValues["Milk Type 2 (1/3)"], size, null, 1/3, totalGramsBeforeMilk);

    var currentAdditionalCosts = (additionalCosts + sizeSpecsDict[size].ContainerCost) * upcharge;

    var thickenerPrice = thickener.price || 0;
    var liquidMix1Price = liquidMix1.price || 0;
    var liquidMix2Price = liquidMix2.price || 0;
    var sweetener1Price = sweetener1.price || 0;
    var sweetener2Price = sweetener2.price || 0;
    var mixIn1Price = solidSimulated.price1 || 0;
    var mixIn2Price = solidSimulated.price2 || 0;

    var pricePerQuantity = milkType1Price + milkType2Price + thickenerPrice + liquidMix1Price + liquidMix2Price + sweetener1Price + sweetener2Price + mixIn1Price + mixIn2Price + currentAdditionalCosts;

    return pricePerQuantity.toFixed(2);
}


function autoSelectValues(flavor, worksheet,size,quantity) { 
    for (var i = 2; i <= Object.keys(worksheet).length; i++) { 
        // Skip header row 
        var flavorCellAddress = `A${i}`; 
        var flavorCell = worksheet[flavorCellAddress]; 
        if (flavorCell && flavorCell.v && flavorCell.v.toLowerCase() === flavor.toLowerCase()) { 
            

            document.getElementById("name").value = flavor;
            document.getElementById("quantity-customize").value = quantity;

            const milkTypeWorksheet = workbook.Sheets['Milk Types Nutrition Per Cup'];

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

            console.log("Flavor is ", flavor);
            console.log(premadeWorksheet);
            //TODO update this to use the dictionaries to simplify
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
        
        document.getElementById('milkType1').value = milkType1; 
        document.getElementById('milkType2').value = milkType2; 
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
                    sizeOptions.push(cell.v);
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
        if (keyCell && keyCell.v) {
            let key = keyCell.v;
            result[key] = {};
            for (let col = firstCol + 1; col <= range.e.c; col++) {
                let header = headers[col - firstCol - 1];
                if (header) {
                    let cell = worksheet[XLSX.utils.encode_cell({r: row, c: col})];
                    result[key][header] = cell ? cell.v : null;
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

document.addEventListener('DOMContentLoaded', () => {

    var flavorUrl = getFlavorFromURL();
    
    // retrieve the workbook data
    fetch('Ice Cream Master Document.xlsm') // Adjust URL as needed 
    .then(response => response.arrayBuffer()) 
    .then(data => { 
        workbook = XLSX.read(data, {type: 'array'});   

           

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
                var amount = specsWorksheet[amountCellAddress] ? specsWorksheet[amountCellAddress].v : 0;
                var multiplier = specsWorksheet[multiplierCellAddress] ? specsWorksheet[multiplierCellAddress].v : 0; 
                var containerCost = specsWorksheet[containerCostCellAddress] ? specsWorksheet[containerCostCellAddress].v : 0; 
                sizeSpecsDict[size] = { "Amount": amount, "Multiplier": multiplier, "ContainerCost": containerCost }; 
            } 
        }

        additionalCosts = specsWorksheet['Q2'] ? specsWorksheet['Q2'].v : 0;
        upcharge = specsWorksheet['N2'] ? specsWorksheet['N2'].v : 0; 
        address = specsWorksheet['L1'] ? specsWorksheet['L1'].v : 0; 
        gallonCost = specsWorksheet['L2'] ? specsWorksheet['L2'].v : 0; 
        carMpg = specsWorksheet['L3'] ? specsWorksheet['L3'].v : 0; 


        fillSpecsDictionary(specsWorksheet, 'D', 'E', liquidSpecs);
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
        populateOptions('Specs', "D", ['liquidMix1Amount','liquidMix2Amount','thickenerAmount']); 
        populateOptions('Specs', "F", ['sweetener1Amount','sweetener2Amount']); 
        populateOptions('Specs', "H", ['mixInAmount']);     

        // Populate all the flavors on then website
        populateFlavorCards('Premade Flavors');  

        if (flavorUrl) {
            console.log("Flavor URL value is ", flavorUrl);
            addToCart(flavorUrl,premadeWorksheet, 1, calculateCustomizePriceFromFlavor(sizeOptions[0],flavorUrl), sizeOptions[0]); 
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

    // Show the checkout modal
    $('#checkoutModal').modal('show');
}



function submitCheckout(event) {
    event.preventDefault(); // Prevent the default form submission

    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);

    fetch('https://formspree.io/f/xlddapjp', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Thank you for your order! We will process it shortly.');
            form.reset(); // Reset the form after successful submission
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
                        var deliveryCost = ((distance / 1609.34) / carMpg) * gallonCost; // Convert meters to miles and calculate cost
                        document.getElementById('deliveryCost').textContent = '$' + deliveryCost.toFixed(2);
                        let totalPrice = parseFloat($('#total-price').text());
                        totalPrice = totalPrice + deliveryCost;
                        $('#finalCost').text(totalPrice.toFixed(2));

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
