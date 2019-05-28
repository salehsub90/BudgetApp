var budgetController = (function() {

})();


var UIController = (function() {
    // some code
})();

var controller = (function (budgetCtrl, UICtrl) {

    var ctrlAddItem = function () {
        // get field input data
        // add item to the budget controller
        // add the item to the UI
        // calculate the budget
        // display the budget on the UI
        console.log('called');
    }

    document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (event) {
        
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }

    });

})(budgetController, UIController);