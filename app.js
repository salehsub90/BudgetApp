var budgetController = (function () {

    //constructors
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    //data structure
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID = 0;

            //create a new id for each item
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //create a new item based on 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function() {
            
            // calculate total incoem and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget, incoem - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //percentage of income
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalEx: data.totals.exp,
                percentage: data.percentage
            }
        }
    };

})();


var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    }
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // inc or exp
                description: document.querySelector(DOMStrings.inputDesc).value,
                value: document.querySelector(DOMStrings.inputValue).value
            };
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>' +
                    '</div>';

            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div>' +
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>' +
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                '</div></div></div>';
            }

            //replace with actual data from the obj
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            //insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function () {
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArray[0].focus();
        },
        getDOMStrings: function () {
            return DOMStrings;
        }
    }
})();

var controller = (function (budgetCtrl, UICtrl) {

    var setUpEventListeners = function () {
        var DOM = UIController.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    };

    var updateBudget = function() {
        // calculate budget
        budgetCtrl.calculateBudget();

        //return budget
        var budget = budgetCtrl.getBudget();
        
        // display on UI
        console.log(budget);
    }

    var ctrlAddItem = function () {
        var input, newItem;

        // get field input data
        input = UICtrl.getInput();

        // add item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        //clear fields 
        UICtrl.clearFields();

        // calculate the budget
        updateBudget();

        // display the budget on the UI
    }

    return {
        init: function () {
            console.log('app has started');
            setUpEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();