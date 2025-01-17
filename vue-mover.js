/*
     Vue-Mover Component
     -------------------
     by Rick Strahl, West Wind Technologies

     Version 0.3.2
     February 9th, 2018
     
     depends on: 
     -----------
     CSS:     
     * font-awesome   (optional)
     * vue-mover.css
     
     Script:
     * vuejs
     * sortablejs
     
     
     Usage:
     ------
      <mover :left-items="selectedItems"
             :right-items="unselectedItems"
             title-left="Available Items"
             title-right="Selected Items"
             moved-item-location="top"
             :font-awesome="true"
             targetId="MyMover"
             @item-moved="onItemMoved"
             >
       </mover>

    Vue code:

    var app = new Vue({
      el: "#Body",
      data: function() { return {
        unselectedItems: [
          {
              value: "vitem1",
              displayValue: "vItem 1",
              isSelected: false
          },
          {
              value: "vitem2",
              displayValue: "vItem 2",
              isSelected: true
          },         
        ],        
        selectedItems: [
          {
              value: "xitem3",
              displayValue: "xItem 3",
              isSelected: false
          }
        ]    
      }
     }
    });             
*/
import "./scripts/Sortable.js";
if (!Sortable) {
    throw new Error('[vue-mover] cannot locate `Sortablejs` dependency.')
}

var vue = Vue.component("mover", {
    vue: vue,
    props: {
        // Left side title - defaults to Available
        titleLeft: {
            type: String,
            default: 'Available'
        },
        // Right side title - defaults to Selected
        titleRight: {
            type: String,
            default: 'Selected'
        },
        // Location where moved items are dropped: top, bottom
        movedItemLocation: {
            type: String,
            default: "top"
        },
        // Array of objects to bind to left list. { value: "xxx", displayValue: "show", isSelected: false}
        leftItems: Array,
        // Array of objects to bind right list. { value: "xxx", displayValue: "show", isSelected: false}
        rightItems: Array,
        // The ID assigned to the wrapping element of this component
        targetId: {
            type: String,
            default: "Mover"
        },
        // determines whether duplicated values are cleared in left items
        normalizeLists: {
            type: Boolean,
            default: true
        },
        fontAwesome: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        raiseItemMoved: function _raiseItemMoved(item, targetList, listType) { 
            this.lastMovedItem =  { item: item, targetList, listType };
            this.$emit('item-moved', this.lastMovedItem);
        },    
    },
    template: '<div :id="targetId" class="mover-container">' + '\n' +
    '    <div id="MoverLeft" class="mover-panel-box mover-left">' + '\n' +
    '        <div class="mover-header">{{titleLeft}}</div>' + '\n' +
    '        <div :id="targetId + \'LeftItems\'" class="mover-panel ">\n' +
    '           <div class="mover-item"' + '\n' +
    '                v-for="item in unselectedItems"' + '\n' +
    '                :class="{\'mover-selected\': item.isSelected }"' + '\n' +
    '                v-on:click="selectItem(item, unselectedItems)"' + '\n' +
    '                :data-id="item.value" data-side="left"' + '\n' +
    '                >{{item.displayValue}}</div>' + '\n' +
    '         </div>\n' +
    '    </div>' + '\n' +
    '' + '\n' +
    '    <div class="mover-controls" >' + '\n' +
    '        <button type="button" v-on:click="moveAllRight()">' + '\n' +
    '                <i v-if="fontAwesome" class="fa fa-forward fa-1.5x" aria-hidden="true"></i>' + '\n' +
    '                <b v-if="!fontAwesome" aria-hidden="true">>></b>' + '\n' +   
    '        </button>' + '\n' +
    '        <button type="button" v-on:click="moveRight()" style="margin-bottom: 30px;" >' + '\n' +
    '            <i v-if="fontAwesome" class="fa fa-caret-right fa-2x" aria-hidden="true"></i>' + '\n' +
    '            <b v-if="!fontAwesome" aria-hidden="true">></b>' + '\n' +   
    '        </button>' + '\n' +
    '        <button type="button" v-on:click="moveLeft()">' + '\n' +
    '            <i v-if="fontAwesome" class="fa fa-caret-left fa-2x" aria-hidden="true"></i>' + '\n' +
    '            <b v-if="!fontAwesome" aria-hidden="true"><</b>' + '\n' +      
    '        </button>' + '\n' +
    '        <button type="button" v-on:click="moveAllLeft()">' + '\n' +
    '            <i v-if="fontAwesome" class="fa fa-backward" aria-hidden="true"></i>' + '\n' +
    '            <b v-if="!fontAwesome" aria-hidden="true"><<</b>' + '\n' +   
    '        </button>' + '\n' +
    '' + '\n' +
    '    </div>' + '\n' +
    '' + '\n' +
    '    <div id="MoverRight" class="mover-panel-box mover-right">' + '\n' +
    '        <div class="mover-header">{{titleRight}}</div>' + '\n' +
    '        <div :id="targetId + \'RightItems\'" class="mover-panel">\n' +
    '           <div class="mover-item"' + '\n' +
    '                v-for="item in selectedItems"' + '\n' +
    '                :class="{\'mover-selected\': item.isSelected }"' + '\n' +
    '                v-on:click="selectItem(item, selectedItems)"' + '\n' +
    '                :data-id="item.value" data-side="right"' + '\n' +
    '                >{{item.displayValue}}</div>' + '\n' +
    '         </div>\n' +
    '    </div>' + '\n' +
    '</div>' + '\n',
    data: function () {
        var vm = {
            selectedSortable: null,
            selectedItem: {},
            selectedList: null,
            selectedItems: this.rightItems,
            unselectedItems: this.leftItems,  
            lastMovedItem: null,                     

            // hook up sortable - call from end of data retrieval
            initialize: function (vue) {
                var options = {
                    group: "_mvgp_" + new Date().getTime(),
                    ghostClass: "mover-ghost",
                    chosenClass: "mover-selected",
                    onAdd: vm.onListDrop,
                    onUpdate: vm.onSorted,                    
                };                

                var targetId = vue.targetId;
                var el = document.getElementById(targetId + 'LeftItems');
                vm.unselectedSortable = Sortable.create(el, options);

                var el2 = document.getElementById(targetId + 'RightItems');
                vm.selectedSortable = Sortable.create(el2, options);

                if (vue.normalizeLists)
                    vm.normalizeListValues();
            },
            selectItem: function (item, items) {
                if (!item) {
                    if (items.length > 0)
                        item = items[0];
                    if (!item) return;
                }
                              
                items.forEach(function (itm) {
                    itm.isSelected = false;
                });
                item.isSelected = true;
                vm.selectedItem = item;
                vm.selectedList = items;
              
            },
            moveRight: function (item, index) {
                if (!item) {
                    var item = vm.unselectedItems.find(function (itm) {
                        return itm.isSelected;
                    });
                }
                if (!item)
                    return;

                // remove item and select next item
                var selectNext = false;
                var idx = vm.unselectedItems.findIndex(function (itm) {
                    return itm.value == item.value;
                });
                vm.unselectedItems.splice(idx, 1);
                if (vm.unselectedItems.length > 0)
                    vm.selectItem(vm.unselectedItems[idx], vm.unselectedItems);

                if (typeof index === "number")
                    vm.selectedItems.splice(index, 0, item);
                else{
                    if(vue.movedItemLocation == "top")
                        vm.selectedItems.unshift(item);
                    else{
                        vm.selectedItems.push(item);                        
                        var container = this.$el.querySelector(".mover-right>.mover-panel");
                        setTimeout(function() {
                            
                            container.scrollTop = container.scrollHeight;                        
                        });                        
                    }
                        
                }

                setTimeout(function () {
                    vm.selectItem(item, vm.selectedItems);
                    vue.raiseItemMoved(item,vm.selectedItems, "right");
                }, 10);
            },
            moveLeft: function (item, index) {
                var item = vm.selectedItems.find(function (itm) {
                    return itm.isSelected;
                });

                if (!item)
                    return;

                // remove item
                var selectNext = false;

                var idx = vm.selectedItems.findIndex(function (itm) {
                    return itm.value == item.value;
                });
                vm.selectedItems.splice(idx, 1);
                if (vm.selectedItems.length > 0)
                    vm.selectItem(vm.selectedItems[idx], vm.selectedItems);

                if (typeof index === "number")
                    vm.unselectedItems.splice(index, 0, item);
                else
                {
                    if(vue.movedItemLocation == "top")
                        vm.unselectedItems.unshift(item);
                    else
                    {
                        vm.unselectedItems.push(item);
                        var container = this.$el.querySelector(".mover-left>.mover-panel");
                        setTimeout(function() { container.scrollTop = container.scrollHeight; });                        
                    }
                }

                setTimeout(function () { 
                    vm.selectItem(item, vm.unselectedItems);                     
                    vue.raiseItemMoved(item, vm.unselectedItems, "left");
                }, 10);

            },
            moveAllRight: function () {
                for (var i = vm.unselectedItems.length - 1; i >= 0; i--) {
                    var item = vm.unselectedItems[i];
                    vm.unselectedItems.splice(i, 1);
                    vm.selectedItems.push(item);
                }
            },
            moveAllLeft: function () {
                for (var i = vm.selectedItems.length - 1; i >= 0; i--) {
                    var item = vm.selectedItems[i];
                    vm.selectedItems.splice(i, 1);
                    vm.unselectedItems.push(item);
                }
            },
            refreshListDisplay: function () {
                setTimeout(function () {
                    var list = vm.selectedItems;
                    vm.selectedItems = [];
                    vm.selectedItems = list;

                    list = vm.unselectedItems;
                    vm.unselectedItems = [];
                    vm.unselectedItems = list;
                }, 10);
            },
            onSorted: function (e) {

                var key = e.item.dataset["id"];
                var side = e.item.dataset["side"];

                var list;
                if (side == "left") {
                    list = vm.unselectedItems;
                    vm.unselectedItems = [];
                }
                else {
                    list = vm.selectedItems;
                    vm.selectedItems = [];
                }

                var item = list.find(function (itm) {
                    return itm.value == key;
                });
                
                if (!item)
                    return;

                setTimeout(function () {
                    list.splice(e.oldIndex, 1);                    
                    list.splice(e.newIndex, 0, item);

                    if (side == "left") {
                        vm.unselectedItems = list;
                        vm.selectItem(item, vm.unselectedItems);
                    }
                    else {
                        vm.selectedItems = list;
                        vm.selectItem(item, vm.selectedItems);
                    }
                });
            },
            onListDrop: function (e) {                
                var key = e.item.dataset["id"];
                var side = e.item.dataset["side"];
                var insertAt = e.newIndex;

                // Hack! Remove the dropped item and let Vue handle rendering
                //e.item.remove();

                if (side == "left") {
                    var item = vm.unselectedItems.find(function (itm) {
                        return itm.value == key;
                    });
                    vm.moveRight(item, insertAt);
                    item.isSelected = true;

                    // force list to refresh
                    var list = vm.unselectedItems;
                    vm.unselectedItems = [];
                    setTimeout(function () {
                        vm.unselectedItems = list;
                    });
                }
                else {
                    var item = vm.selectedItems.find(function (itm) {
                        return itm.value == key;
                    });
                    item.isSelected = true;
                    vm.moveLeft(item, insertAt);

                    // force list to refresh completely
                    var list = vm.selectedItems;
                    vm.selectedItems = [];
                    setTimeout(function () {
                        vm.selectedItems = list;
                    });
                }

            },
            // removes dupes from unselected list that exist in selected items
            normalizeListValues: function () {
                if (!vm.selectedItems || vm.selectedItems.length == 0 ||
                    !vm.unselectedItems || vm.unselectedItems.length == 0)
                    return;

                for (var i = 0; i < vm.selectedItems.length; i++) {
                    var selected = vm.selectedItems[i];

                    var idx = vm.unselectedItems.findIndex(function (itm) {
                        return itm.value == selected.value;
                    });
                    if (idx > -1)
                        vm.unselectedItems.splice(idx, 1);
                }
            }
        }

        var vue = this;
        setTimeout(function () { vm.initialize(vue); });

        return vm;
    }
});



// if (typeof exports == "object") {
//     module.exports = vue;
//   } else if (typeof define == "function" && define.amd) {
//     define([], function () {
//       return vue;
//     })
//   } else if (window.Vue) {
//     window.vMover = vue;        
//   }


// IE Array Polyfills

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function (predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return kValue.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return undefined.
            return undefined;
        }
    });
}
// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return -1.
            return -1;
        }
    });
}
