var budgetController = (function() {

})();


var UIController = (function() {
    // some code
})();

var controller = (function (budgetCtrl, UICtrl) {

    document.querySelector('.add__btn').addEventListener('click', function() {
        // get field input data
        // add item to the budget controller
        // add the item to the UI
        // calculate the budget
        // display the budget on the UI
    });

    document.addEventListener('keypress', function (event) {
        console.log(event);
    });

})(budgetController, UIController);