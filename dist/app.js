var UIcontroller = (function () {
    var DOMstrings = {
        inptype : '.add__type',
        description : '.add__description',
        value : '.add__value', 
        inputBtn :'.add__btn', 
        incContainer :'.income__list',
        expContainer : '.expenses__list',
        budgetlabel : '.budget__value',
        budgetinclabel :'.budget__income--value',
        budgetexplabel:'.budget__expenses--value',
        budgetperlabel : '.budget__expenses--percentage',
        container: '.container',
        expPerlabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };
    
    var format_num= function(num,type){
            var int,dec;
            num = Math.abs(num);
            num = num.toFixed(2);// now in string
            num_split = num.split('.');
            int = num_split[0];
            
            if(int.length>3){
               int = int.substr(0,int.length-3)+","+int.substr(int.length-3,3);
            }
            dec = num_split[1];
        return   (type ==='exp'?"-":"+")+" "+int+"."+dec;
        };
    var listforEach = function(list, callback){
                for(var i=0; i<list.length; i++)
                    callback(list[i], i);
                    
            };
    return {
        getInput : function () {
            return {
                typ : document.querySelector(DOMstrings.inptype).value,
                des : document.querySelector(DOMstrings.description).value,
                val : parseFloat(document.querySelector(DOMstrings.value).value)
            };  
        },
        getDOMstrings: DOMstrings,
        addListItems : function(obj, type){
            
            var html, newhtml, element;
            //create html str for placeholder
            if(type ==='inc'){
                element = DOMstrings.incContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type ==='exp'){
                element = DOMstrings.expContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%per%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replace plcholder with actual txt
            
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.desc);
            newhtml = newhtml.replace('%value%', format_num(obj.val,type));

            //insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
        },
        delete_item_list: function(selID){
            var el=document.getElementById(selID);
            el.parentNode.removeChild(el);
            
        },
        clearfield : function(){
            var fields;
            fields = document.querySelectorAll(DOMstrings.description+', '+DOMstrings.value);
            var fieldArr =Array.prototype.slice.call(fields);
            fieldArr.forEach(function(curr, i , arr){
                curr.value="";
            fieldArr[0].focus();  
            })
        },
        disp_bgt : function(obj){
            var type;
            obj.budget>0?type='inc':type='exp';
            document.querySelector(DOMstrings.budgetlabel).textContent = format_num(obj.budget,type);
            document.querySelector(DOMstrings.budgetinclabel).textContent = format_num(obj.totalInc,'inc');
            document.querySelector(DOMstrings.budgetexplabel).textContent = format_num(obj.totalExp,'exp');
            if(obj.per>0)
                document.querySelector(DOMstrings.budgetperlabel).textContent = obj.per+"%";
            else
                document.querySelector(DOMstrings.budgetperlabel).textContent = "---";

        },
        disp_percent : function(percents){
            var fields = document.querySelectorAll(DOMstrings.expPerlabel);
            listforEach(fields, function(current, index){
                if(percents[index]>0)
                    current.textContent = percents[index]+"%";
                else
                    current.textContent = '---';
            });
            
        },
        disp_month : function(){
            var now,year,month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'Feburary', 'March', 'April','May','June','July','August', 'September','October','November','December'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month]+" "+year;
        },
        changetype : function(){
            var fields = document.querySelectorAll(DOMstrings.inptype+', '+DOMstrings.description+', '+ DOMstrings.value);
            listforEach(fields,function(curr,i){
                curr.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        }
        
    };
})();


var BudgetController = (function(){
    var Expense = function(id, desc, val){
        this.id = id;
        this.desc = desc;
        this.val = val;
        this.percent = -1;
    };
    
    Expense.prototype.cal_percentage = function(tot_inc){
        if(tot_inc>0)
            this.percent = Math.round(this.val/tot_inc*100);
        else
            this.percent = -1;
    };
    Expense.prototype.get_percent = function(){
        return this.percent;
    }
    var Income = function(id, desc, val){
        this.id = id;
        this.desc = desc;
        this.val = val;
        };
    var data = {
        items : {
            exp :[],
            inc:[]
        },
        totals : {
            inc :0,
            exp:0
        },
        budget:0,
        per:-1
    }
    var calc_total = function(type){
      var sum = 0;
        data.items[type].forEach(function(curr){
            sum+= curr.val;
        })
        data.totals[type] = sum;
        
    };
    return {
        newItem : function(type, desc, value){
            var additem,ID;
            if(data.items[type].length >0)
                ID = data.items[type][data.items[type].length-1].id + 1;
            else
                ID = 0;
            if(type==='exp')
                additem = new Expense(ID,desc,value);
            else if(type ==='inc')
                additem = new Income(ID,desc,value);
            data.items[type].push(additem);
            return additem;

        },
        
        delete_item : function(type, ID){
            
            var ids = data.items[type].map(function(curr){
               return curr.id; 
                
            });
            
            var target_ind = ids.indexOf(ID);
            if(target_ind!==-1)
                data.items[type].splice(target_ind,1)
            
        },
        get_budget:function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                per : data.per
            };
            
        }, 
        
        calc_budget : function(){
                calc_total('inc');
                calc_total('exp');
            
            //budget
            data.budget = data.totals.inc - data.totals.exp;
            
            // %of income spent
            if(data.totals.inc >0)
                data.per = Math.round(data.totals.exp / data.totals.inc *100);
            else
                data.per = -1;
          
            
            },
        calculate_percentage:function(){
            data.items.exp.forEach(function(curr){
                curr.cal_percentage(data.totals.inc);
                
            });
            
            
        },
        get_percentage : function(){
            var all_per = data.items.exp.map(function(curr){
                            return curr.get_percent();
            });
            return all_per;
        }
    }
})();


var AppController = (function(budgetctrl, uictrl){
    
    var setupEventListeners = function()
    {
        var DOM = uictrl.getDOMstrings;
        document.querySelector(DOM.inptype).addEventListener('change', uictrl.changetype);
        document.querySelector(DOM.inputBtn).addEventListener('click', controlAddItem);
        document.addEventListener('keypress', function(event)
                                  {
                                        if(event.keyCode ===13|| event.which ===13)
                                            controlAddItem(); 
    
        
        });
        
        document.querySelector(DOM.container).addEventListener('click', controlDelItem);
    };
    
    var bgtcalc = function(){
        //1) calc budget
        budgetctrl.calc_budget();
        
        //2) disp budget
        var bgt = budgetctrl.get_budget();
        
        
        //3) display budget on UI
        uictrl.disp_bgt(bgt);
        
        
    };
    var updatePer = function(){
        //1)calc per
        budgetctrl.calculate_percentage();
        
        //2)read from bgtctrler
        var per = budgetctrl.get_percentage();
        
        
        //3)update ui
        uictrl.disp_percent(per);
    }
    var controlAddItem = function()
    {   
        
        var input,newItem;
        //1) get field input data 
        input = uictrl.getInput();
        if(input.des!==""  && !isNaN(input.val) && input.val>0)
        {
        //2) add item to bdgetctrler
        newItem = budgetctrl.newItem(input.typ,input.des, input.val);
        //3) add item to UIctrl
        uictrl.addListItems(newItem, input.typ);
        
        //clear fields
        uictrl.clearfield();
        
        // 4)update budget
        bgtcalc();
            
            
            //5)update per
            updatePer();
            
    }
      
    };
    
    
    var controlDelItem = function(event){
        var itemID,splitID, type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1) del item from ds
            budgetctrl.delete_item(type,ID);
            
            //2)del item from UI
            uictrl.delete_item_list(itemID);
            
            
            //3) update and disp budget on UI
            bgtcalc(type);
            
            
            updatePer();
        }
    };
   
    return {
        init: function(){
            
            setupEventListeners();
            uictrl.disp_month();
            uictrl.disp_bgt({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                per :-1
            });
        }
    }
    
})(BudgetController, UIcontroller);

AppController.init();