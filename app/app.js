'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', ['ui.calendar']);


app.controller('CalController', function($scope, $http, $filter) {
    /* config object */

    $scope.freeHrsDate = {};
    $scope.displayTime;
    $http.get('users.json').success(function(data) {
        $scope.users = data;
        $http.get('resource_event.json').success(function(data) {
            $scope.resource_event = data;
            $scope.assign();
            $scope.calculateHrs();
            $scope.calculateTaskWork();
            $scope.calculateRelativeWork();
            $scope.calculateMeetingWork();
        });


    });

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

    $scope.getName = function(id) {
        angular.forEach($scope.users.result, function(data) {
            if(data.sys_id == id) {
                return data.name;
            }
        });
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

    }

    $scope.Hours = {};
    $scope.tasks = [];
    $scope.meeting = [];


    $scope.calculateHrs = function() {

        var count = 0;
        var name;
        angular.forEach($scope.usersSchedule, function(value, key) {

            angular.forEach($scope.users.result, function(data) {
                if(data.sys_id == key) {
                    name = data.name;
                }
            });
            angular.forEach($scope.usersSchedule[key], function(data1) {
                angular.forEach(data1, function(data2) {

                    if(data2.value == 1) {
                        count = count+1;
                    }
                });

            });

            $scope.hours[name] = count;
            count = 0;

        });


    };

    $scope.calculateTaskWork = function() {

        var count = 0;
        var name;
        var i = 0;

        angular.forEach($scope.usersSchedule, function(value, key) {
            angular.forEach($scope.users.result, function(data) {
                if(data.sys_id == key) {
                    name = data.name;
                }
            });
            angular.forEach($scope.usersSchedule[key], function(data1) {
                angular.forEach(data1, function(data2) {
                    if(data2.type == "task") {
                        count = count+1;
                    }
                });

            });

            $scope.tasks[i] = {};
            $scope.tasks[i].name = name;
            $scope.tasks[i++].value = count;
            count = 0;

        });

        var start;
        var end;
        $scope.tasks.sort(function(a,b) {
            end = a.value;
            start = b.value;
            return start - end ;
        });

    };

    $scope.calculateMeetingWork = function() {

        var count = 0;
        var name;
        var i =0;
        angular.forEach($scope.usersSchedule, function(value, key) {
            angular.forEach($scope.users.result, function(data) {
                if(data.sys_id == key) {
                    name = data.name;
                }
            });
            angular.forEach($scope.usersSchedule[key], function(data1) {
                angular.forEach(data1, function(data2) {

                    if(data2.type == "meeting") {
                        count = count+1;
                    }
                });

            });
            // $scope.meeting[name] = count;
            $scope.meeting[i] = {};
            $scope.meeting[i].name = name;
            $scope.meeting[i++].value = count;
            count = 0;

        });


        var start;
        var end;
        $scope.meeting.sort(function(a,b) {
            end = a.value;
            start = b.value;
            return start - end ;
        });



    };

    $scope.freeUsers = {};
    $scope.calculateRelativeWork = function() {

        var found = false;
        var count = 0;
        var name;
        angular.forEach($scope.usersSchedule, function(value, key) {
            angular.forEach($scope.users.result, function(data) {
                if(data.sys_id == key) {
                    name = data.name;
                }
            });
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
                $scope.freeUsers[name] = 1;
            }
            else {
                $scope.freeUsers[name] = 0;
            }
            count = 0;
        });

       

    };


    $scope.addTask = function(selected) {

        $scope.user[selected.sys_id] = {};
        $scope.freeHrsDate[selected.sys_id] = {};
        $scope.events.splice(0, $scope.events.length);
        for (var i = 0; i < $scope.resource_event.result.length; i++) {

            if ($scope.resource_event.result[i].user.value == selected.sys_id) {

                $scope.startDate = $filter('date')($scope.resource_event.result[i].start_date_time, 'MM/dd/yyyy h:mm a');
                $scope.startTime = $filter('date')($scope.resource_event.result[i].start_date_time, 'h:mm');
                $scope.endDate = $filter('date')($scope.resource_event.result[i].end_date_time, 'MM/dd/yyyy');
                $scope.endDate1 = $filter('date')($scope.resource_event.result[i].end_date_time, 'MM/dd/yyyy h:mm a');
                $scope.endTime = $filter('date')($scope.resource_event.result[i].end_date_time, 'h:mm');

                $scope.startDate2 = $filter('date')($scope.resource_event.result[i].start_date_time, 'yyyy-MM-ddTHH:mm:ss');
                $scope.endDate2 = $filter('date')($scope.resource_event.result[i].end_date_time, 'yyyy-MM-ddTHH:mm:ss');

                $scope.events.push({
                    title: $scope.resource_event.result[i].type,
                    start: $scope.startDate,
                    end: $scope.endDate1

                });

                if (typeof $scope.user[selected.sys_id][$scope.endDate] != 'undefined') {
                    if (typeof $scope.user[selected.sys_id][$scope.endDate].days != 'undefined') {
                        $scope.user[selected.sys_id][$scope.endDate].days.push($scope.startDate2, $scope.endDate2);
                    }
                    else {
                        $scope.user[selected.sys_id][$scope.endDate].days = [];
                        $scope.user[selected.sys_id][$scope.endDate].days.push($scope.startDate2, $scope.endDate2);
                    }
                }
                else {
                    $scope.user[selected.sys_id][$scope.endDate] = {};
                    $scope.user[selected.sys_id][$scope.endDate].days = [];
                    $scope.user[selected.sys_id][$scope.endDate].days.push($scope.startDate2, $scope.endDate2);

                }
            }

        }


    };


});