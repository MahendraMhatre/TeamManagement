'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ui.calendar']);
init();

function init() {


};


app.controller('CalController', function($scope, $http, $filter) {
    /* config object */

    $scope.freeHrsDate = {};
    $scope.displayTime;
    $http.get('users.json').success(function(data) {
        $scope.users = data;
        $http.get('resource_event.json').success(function(data) {
            $scope.resource_event = data;
            $scope.assign();
        });


    });




    $scope.currentUser = function(selected) {
        $scope.display = selected;

    };

    var date = new Date();


    /* event source that contains custom events on the scope */
    $scope.events = [];

    $scope.uiConfig = {
        calendar:{
            height: 450,
            editable: true,
            header:{
                left: 'month agendaWeek agendaDay',
                center: 'title',
                right: 'today prev,next'
            },
            eventClick: $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender

        }
    };

    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };

    /* Change View */
    $scope.changeView = function(view,calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };

    /* Change View */
    $scope.renderCalender = function(calendar) {
        if(uiCalendarConfig.calendars[calendar]){
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) {
        element.attr({'tooltip': event.title,
            'tooltip-append-to-body': true});
        $compile(element)($scope);
    };

    /* event sources array*/

    $scope.eventSources = [$scope.events];

    $scope.user = {};
    $scope.hours = {};
    $scope.startDate = 6;
    $scope.endDate = 10;
    $scope.startTime = 8;
    $scope.endTime = 17;
    $scope.usersSchedule = {};

   $scope.assign = function() {

       for (var k = 0; k < $scope.users.result.length; k++) {
           var userSchedule = {};
           for (var j = $scope.startDate; j <= $scope.endDate; j++) {
               if (j < 10)
                   userSchedule["03/0" + j + "/2017"] = {};
               else
                   userSchedule["03/" + j + "/2017"] = {};

               for (var i = $scope.startTime; i <$scope.endTime; i++) {
                   if (j < 10)
                       userSchedule["03/0" + j + "/2017"][i+'-'+(i+1)] = {
                           startTime: i,
                           endTime: i + 1,
                           value: 0,
                       };
                   else
                       userSchedule["03/" + j + "/2017"][i+'-'+(i+1)] = {
                           startTime: i,
                           endTime: i + 1,
                           value: 0,
                       };
               }
           }
           $scope.usersSchedule[$scope.users.result[k].sys_id] = userSchedule;
       }

       for (var k = 0; k < $scope.users.result.length; k++) {

           for (var l = 0; l < $scope.resource_event.result.length; l++) {

               var event_id = $scope.resource_event.result[l].sys_id;
               var event_name = $scope.resource_event.result[l].name;
               var event_start_date = $filter('date')($scope.resource_event.result[l].start_date_time, 'd');
               var event_start_hour = $filter('date')($scope.resource_event.result[l].start_date_time, 'H');
               var event_end_hour = $filter('date')($scope.resource_event.result[l].end_date_time, 'H');
               var event_type = $scope.resource_event.result[l].type;
               var event_user_id = $scope.resource_event.result[l].user.value;

               if ($scope.users.result[k].sys_id == event_user_id) {

                   for (var j = $scope.startDate; j <= $scope.endDate; j++) {

                       for (var i = $scope.startTime; i <$scope.endTime; i++) {

                           if (j == event_start_date && i >= event_start_hour && i < event_end_hour) {
                               if (j < 10) {
                                   $scope.usersSchedule[$scope.users.result[k].sys_id]["03/0" + j + "/2017"][i+'-'+(i+1)] = {
                                       event_id: event_id,
                                       event_name: event_name,
                                       startTime: i,
                                       endTime: i + 1,
                                       value: 1,
                                       type: event_type,
                                   };
                               } else {
                                   $scope.usersSchedule[$scope.users.result[k].sys_id]["03/" + j + "/2017"][i+'-'+(i+1)] = {
                                       event_id: event_id,
                                       event_name: event_name,
                                       startTime: i,
                                       endTime: i + 1,
                                       value: 1,
                                       type: event_type,
                                   };
                               }
                           }

                       }

                   }

               }
           }
       }
       console.log($scope.usersSchedule);
   }

    $scope.Hours = {};
    $scope.tasks = {};
    $scope.meeting = {};


    $scope.calculateHrs = function() {

        var count = 0;

        angular.forEach($scope.usersSchedule, function(value, key) {
            angular.forEach($scope.usersSchedule[key], function(data1) {
                angular.forEach(data1, function(data2) {
                    console.log(data2);
                    if(data2.value == 1) {
                        count = count+1;
                    }
                });

            });
            $scope.hours[key] = count;
            count = 0;

        });

        console.log("Hours");
        console.log($scope.hours);
    };

    $scope.calculateTaskWork = function() {

        var count = 0;
        angular.forEach($scope.usersSchedule, function(value, key) {
            angular.forEach($scope.usersSchedule[key], function(data1) {
                angular.forEach(data1, function(data2) {

                    if(data2.type == "task") {
                        count = count+1;
                    }
                });

            });
            $scope.tasks[key] = count;
            count = 0;

        });
        console.log("Tasks");
        console.log($scope.tasks);
    };

    $scope.calculateMeetingWork = function() {

        var count = 0;
        angular.forEach($scope.usersSchedule, function(value, key) {
            angular.forEach($scope.usersSchedule[key], function(data1) {
                angular.forEach(data1, function(data2) {

                    if(data2.type == "meeting") {
                        count = count+1;
                    }
                });

            });
            $scope.meeting[key] = count;
            count = 0;

        });

        console.log("meeting");
        console.log($scope.meeting);
    };

    $scope.freeUsers = {};
    $scope.calculateRelativeWork = function() {

        var found = false;
        var count = 0;

        angular.forEach($scope.usersSchedule, function(value, key) {
            angular.forEach($scope.usersSchedule[key], function(date) {
                angular.forEach(date, function(times) {
                    if(times.startTime  < 12) {
                        if(times.value == 0 ) {
                            found = true;
                        }
                    }

                });
                if(found == true){
                    count++;
                    found = false;
                }

            });
            if(count == 5) {
                $scope.freeUsers[key] = 1;
            }
            else {
                $scope.freeUsers[key] = 0;
            }
            count = 0;
        });

        console.log("Free Users");
        console.log($scope.freeUsers);

    };






});