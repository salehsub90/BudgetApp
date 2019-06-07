var budgetController = (function () {

    //constructors
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += parseFloat(cur.value);
        });
        data.totals[type] = parseFloat(sum);
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
        
        deleteItem: function (type, id) {
            var ids, indexID;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            indexID = ids.indexOf(id);

            if (indexID !== -1) {
                data.allItems[type].splice(indexID, 1);
            }
        },

        calculateBudget: function() {
            
            // calculate total incoem and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget, income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //percentage of income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach( function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
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
        expensesContainer: '.expenses__list',

        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        budgetMonthLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var integer, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        var numSplit = num.split('.');
        integer = numSplit[0];
        if (integer.length > 3) {
            integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3);
            // 123456 -> 123456.00 -> 123,456.00
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + integer + '.' + dec;
    };

    var nodeListForeach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


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
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>' +
                    '</div>';

            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>' +
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                '</div></div></div>';
            }

            //replace with actual data from the obj
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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
        displayNumbers: function (obj) {
            var type;
            type = obj.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.itemPercentage);

            nodeListForeach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
            });
        },

        displayMonth: function() {
            var now, month, months, year;
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            months = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.budgetMonthLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ', ' + DOMStrings.inputDesc + ', ' + DOMStrings.inputValue
            );

            nodeListForeach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // calculate budget
        budgetCtrl.calculateBudget();

        //return budget
        var budget = budgetCtrl.getBudget();
        
        // display on UI
        console.log(budget);
        UICtrl.displayNumbers(budget);
    };

    var updatePercentages = function() {
        // calculate percentage
        budgetCtrl.calculatePercentages();

        // read it from the controller
        var perc = budgetController.getPercentages();

        // update ui with the new percentage
        console.log(perc);
        UICtrl.displayPercentages(perc);
    };

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

        // calculate and update percentage
        updatePercentages();
    };

    var ctrlDeleteItem = function (event) {
        var type, itemID, splitID, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // delete item from the ui
            UICtrl.deleteListItem(itemID);

            // update and show the new budget
            updateBudget();

            // calculate and update percentage
            updatePercentages();
        }        
    }

    return {
        init: function () {
            console.log('app has started');
            UICtrl.displayNumbers({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
            UICtrl.displayMonth();
        }
    };

})(budgetController, UIController);

controller.init();