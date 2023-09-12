
var BookingManager = function(AppMan) {
    const consolex = {
        log: function(msg) {}
    }
    function getParameters() {
        const params = window.location.href.split("?")[1]
        if (typeof(params) === 'undefined') {
            return ""
        } else {
            return "?" + params
        }
    }
    function getHashCode() {
        const hash = window.location.href.split("?")[0].split("#")[1]
        if (typeof(hash) === 'undefined') {
            return ""
        } else {
            return "#" + hash.split("-")[0]
        }
    }
    function getServer() {
        const server = window.location.href.split("?")[0].split("#")[0]
        if (typeof(server) === 'undefined') {
            return ""
        } else {
            return server
        }
    }
    function getFormattedDate(today) {
        const date = today.getDate();
        const month = today.getMonth() + 1; // months are zero-indexed, so add 1
        const year = today.getFullYear();

        const todayString = `${year}-${month}-${date}`;
        console.log("getTodayDate = " + todayString); // outputs something like "4/27/2023"
        return todayString
    }
    function getTodayDate(daystoadd) {
        const today = new Date();
        today.setDate(today.getDate() + daystoadd);
        return getFormattedDate(today)
    }
    var CompletionMethodObj = function (event) {
        var LastClickEvent = null
        var CompletionSet = false
        var CompletionMethod = function (event) {}
        function testExecOrWait() {
            if (LastClickEvent != null ) {
                if (CompletionSet == true) {
                    CompletionMethod(LastClickEvent)
                    LastClickEvent = null
                    CompletionSet = false
                }
            }
        }
        return {
            getLastClickEvent: function (completion) {
                CompletionSet = true
                CompletionMethod = completion
                testExecOrWait()
            },
            setLastClickEvent: function (event) {
                LastClickEvent = event
                testExecOrWait()
            }
       }
    }
    function closeSidebar() {
        const message = {
            operation: 'closesidebar',
        }
        try {
            window.parent.postMessage(JSON.stringify(message), "*");
            console.log("message posted [" + JSON.stringify(message) + "]")
        } catch (e) {
            console.log(e.toString())
        }
    }

    const Completion = CompletionMethodObj()
    const searchParams = new URLSearchParams(getParameters());
    var Calendar = null
    var CalendarCloned = null
    var CalendarDenolc = null
    function sendToParent(message) {
        try {
            window.parent.postMessage(JSON.stringify(message), "*");
            console.log("message posted [" + JSON.stringify(message) + "]")
        } catch (e) {
            console.log("sendURLTOParent: " + e.toString())
        }
    }
    function exitlogin() {
      var message = {
        operation: "exitlogin"
      };
      sendToParent(message)
    }
    function sendURLTOParent (params) {
        var message = {
            operation: "seturistate",
            newhref: params,
        }
        sendToParent(message)
    }
    function getMonth(indatestr) {
        try {
            function getValidDateStr(datestr) {
                function getNextValue() {
                    if (datestr === CurrentDate) {
                        return Calendar.getDate()
                    } else {
                        return getValidDateStr(CurrentDate)
                    }
                }
                if (typeof(datestr) === "undefined") {
                    return getNextValue(CurrentDate)
                } else
                if (datestr == null) {
                    return getNextValue(CurrentDate)
                } else {
                    return datestr
                }
            }
            const datestr = getValidDateStr(indatestr)
            const newmoment = moment(datestr, "YYYY-MM-DD");
            const newdatestr = newmoment.format("YYYY-MM");
            console.log("New string: [" + newdatestr + "] CurrentDate: [" + CurrentDate + "]")
            return newdatestr
        } catch (e) {
            console.log(e.toString())
        }
        return indatestr
    }
    function getNewParameters(datestr) {
        const paramsobj = new URLSearchParams(getParameters());
        function getAttrName() {
            if (CurrentView === 'timeGridDay') {
                return 'date'
            } else {
                return 'date'
            }
        }
        function getNewDate() {
            if (CurrentView === 'timeGridDay') {
                return datestr
            } else {
                return getMonth(datestr)
            }
        }
        const attrname = getAttrName()
        const newdate = getNewDate()
        paramsobj.delete(attrname)
        paramsobj.append(attrname, newdate)
        const params = paramsobj.toString()
        if (typeof(params) === 'undefined') {
            return "?" + attrname + "=" + newdate
        } else
        if (params.length > 0) {
            return "?" + params
        } else {
            return "?" + attrname + "=" + newdate
        }
    }
    function pushState(newdate) {
        if (typeof(newdate) === 'undefined') {
        } else
        if (newdate === null ) {
        } else {
            const params = getNewParameters(newdate)
            sendURLTOParent(params)
        }
    }
    function popupRequest(message) {
        console.log("Pop up appointment request.")
        closeSidebar()
        Completion.getLastClickEvent( function (event) {
            console.log("Completion: " + JSON.stringify(message))
          try {
              message.xpos = event.clientX
              message.ypos = event.clientY
              console.log("Create: ypos = " + event.clientY )
              const minutesToAddF = () => {
                const mins = (((event.clientY - 106) / (460 - 106)) * 8 * 60)
                return (((mins / 30) | 0) * 30)
              }
              console.log("datetime=[" + message.datetime + "]")
              const minutesToAdd = minutesToAddF()
              const eventStartTime = moment(message.datetime)
              eventStartTime.set({ hour: 9, minute: 0, second: 0 });
              eventStartTime.add(minutesToAdd, 'minutes')
              message.datetime = eventStartTime.toISOString()
              console.log("minutesToAdd=" + minutesToAdd + " startdate=" + message.datetime)
              console.log("href=" + window.location.href)
              window.parent.postMessage(JSON.stringify(message), "*");
          } catch (e) {
            console.log(e.toString())
          }
        })
    }
    var CurrentDate = "2023-01-01"
    var CurrentView = null
    function setCurrentDate(calendar, indateStr) {
        const dateStr = indateStr.replace(/^[^\d]+/, "");
        console.log("select date = [" + dateStr + "]")
        if (CurrentDate !== dateStr || calendar !== Calendar)
        try {
            function getInitialState () {
                if (dateStr.length < 8) {
                    $('.month-button').css("display", "none")
                    return {
                        currentview: 'dayGridMonth',
                        formatstring: 'YYYY-MM'
                    }
                } else {
                    $('.month-button').css("display", "block")
                    return {
                        currentview: 'timeGridDay',
                        formatstring: 'YYYY-MM-DD'
                    }
                }
            }
            const state = getInitialState()
            var parsedDate = moment(dateStr, state.formatstring);
            calendar.changeView(state.currentview, dateStr);
            CurrentView = state.currentview
            CurrentDate = dateStr
            console.log("CurrentDate=[" + CurrentDate + "]")
        } catch (e) {
            console.log("setCurrenDate: " + e.toString())
        }
    }
    function addToDate(datestr, days) {
        try {
            var parsedDate = moment(datestr, "YYYY-MM-DD");
            var newMoment = parsedDate.add(days, 'days');
            return newMoment.format("YYYY-MM-DD");
        } catch (e) {
            console.log(e.toString())
        }
        return datestr
    }
    function addToMonth(datestr, months) {
        try {
            var parsedDate = moment(datestr, "YYYY-MM");
            var newMoment = parsedDate.add(months, 'months');
            return newMoment.format("YYYY-MM");
        } catch (e) {
            console.log(e.toString())
        }
        return datestr
    }
    function convertDate(datestr, duration) {
        try {
            var parsedDate = moment(datestr, "dddd, MMMM D, YYYY [at] h:mm A [EDT]");
            var newMoment = parsedDate.add(duration, 'minutes');
            return newMoment.format("YYYY-MM-DDTHH:mm:ss");
        } catch (e) {
            console.log(e.toString())
            return ""
        }
    }
    function filterDate() {
        try {
            const datestr = searchParams.get("date").replace(/"/g, '');
            return datestr
        } catch (e) {
            console.log("getting date from query: ", e.toString())
        }
        return null
    }
    const date = filterDate()
    console.log("BookingManager() params=[" + date + "]")

    function switchDay(offset) {
        if (CurrentView === 'timeGridDay') {
            setCurrentDate(Calendar, addToDate(CurrentDate, offset))
            pushState(CurrentDate)
        } else {
            setCurrentDate(Calendar, addToMonth(CurrentDate, offset))
            pushState(CurrentDate)
        }
        console.log('Next/Prev button clicked; new date is [' + CurrentDate + "]");
    }
    var SalonData = []
    function startCalendar(identifier, setCalendar, indata) {
            const calendarEl = document.getElementById(identifier)
            const data = ()=> {
                if (typeof(indata) === 'undefined') {
                    return []
                } else {
                    SalonData = indata
                    return [] //indata
                }
            }
            calendar = new FullCalendar.Calendar(calendarEl, {
            customButtons: {
              prev: {
                text: 'Prev',
                click: function(info) { switchDay(-1) }
              },
              next: {
                text: 'Next',
                click: function(info) { switchDay(1) }
              }
            },
             select: function(start, end, allDay) {
                var check = $.fullCalendar.formatDate(start,'yyyy-MM-dd');
                var today = $.fullCalendar.formatDate(new Date(),'yyyy-MM-dd');
                if(check < today)
                {
                    console.log("Exclude day")
                }
                else
                {
                    console.log("Allow day")
                }
            },
            events: data(),
            initialView: 'dayGridMonth',
            validRange: function() {
                return {
                  start: getTodayDate(0),
                  end: getTodayDate(120)
                }
            },
            themeSystem: 'material',
             contentHeight: 'auto',
            eventClassNames: function(arg) {
                console.log("eventClassNames = " + JSON.stringify(arg))
                const eventDate = new Date(arg.event.end)
                const currentDate = new Date();
                if (eventDate < currentDate) {
                    return [ 'hiddenevent']
                } else
                if (arg.view.type === 'timeGridDay') {
                    return [ 'appointment', 'confirmed' ]
                }
                return []
            },
             eventClick: function(info) {
               console.log('Event clicked:', JSON.stringify(info));

               if (info.view.type === 'timeGridDay') {
                 if (info.event.extendedProps.customtype === "availability") {
                    console.log("info.event.start=[" + info.event.start + "]")
                    popupRequest({
                      operation: 'showappointmentrequest',
                      datetime: info.event.start,
                      usermessage: ""
                    })
                 } else {
                    popupRequest({
                      operation: 'changeappointmentrequest',
                      datetime: info.event.start,
                      usermessage: info.event.title,
                      event: info.event
                    })
                 }
               } else {
                    const newdate = convertDate(info.event.start)
                    console.log("newdate=[" + info.event.start + "]")
                    console.log("newdate=[" + newdate + "]")
                    const dateonly = newdate.split('T')[0]
                    setCurrentDate(Calendar, dateonly)
                    pushState(dateonly)
               }
             },
             dateClick: function(info) {
              console.log('Clicked on: ' + info.dateStr);
              console.log('Coordinates: ' + JSON.stringify(info.jsEvent) ) //.pageX + ',' + info.jsEvent.pageY);
              const timeselect = info.dateStr.split("T")[1]
             if (info.view.type !== 'timeGridDay') {
                  setCurrentDate(Calendar, info.dateStr)
                  pushState(info.dateStr)
             } else {
                  popupRequest({
                      operation: 'showappointmentrequest',
                      datetime: info.dateStr,
                      usermessage: "",
                  })
              }
            },
              headerToolbar: {
                  center: '',
                  end: 'prev,next',
              },
            views: {
                timeGridDay: {
                    buttonText: 'My Button',
                    type: 'timeGridDay',
                    allDaySlot: false,
                    slotMinTime: '9:00:00',
                    slotDuration: '00:30:00',
                    displayEventTime: false,
                }
            },
           })

         setCalendar(calendar)

          calendar.render()
   }

    document.getElementById("calendar").addEventListener("click", function(event) {
        const x = event.clientX;
        const y = event.clientY;
        console.log("Clicked at position (${x}, ${y})")
        Completion.setLastClickEvent(event)
        closeSidebar()
    })
    const FilterState = {
        current: {
            classname: "",
            services: ""
        }
    }
    function getServiceValue(name, defval) {
         const value = AppMan.getQueryValue(name)
         if (value == null) {
            if (typeof(defval) === 'undefined') {
                return ""
            } else {
                return defval
            }
         } else {
            return value
         }
    }
    function getServicesObj() {
        const ret = {
            classname: "",
            services: ""
        }
        try {
            ret.classname = getServiceValue("classname", FilterState.current.classname).replace(/_/g, ' ')
            ret.services = getServiceValue("services", FilterState.current.services).replace(/_/g, ' ')
        } catch (e) {
            console.log(e.stack.toString())
        }
        FilterState.last = FilterState.current
        FilterState.current = ret
    }
    function createEvent(data, infilter) {
      function getFilter() {
        if (typeof(infilter) !== 'undefined') {
            FilterState.last = FilterState.current
            FilterState.current = infilter
        }
        return FilterState.current
      }
      const filter = getFilter()
      function getTitle() {
        try {
            if (data.request.usermessage.length > 0) {
                return data.request.usermessage
            }
        } catch (e) {
            console(e.toString())
        }
        return "Appointment booked."
      }
      console.log("Salon hours: " + window.location.href)

      //var event = {
      //  title: getTitle(),
      //  start: convertDate(data.request.datetime, 0),
      //  end: convertDate(data.request.datetime, 30)
      //}
      //console.log(JSON.stringify(event))
      //Calendar.addEvent(event);
      Calendar.getEvents().forEach(function(event) {
          event.remove();
        })
      Calendar.batchRendering(() => {
        if (data != null) {
            data.events.forEach((newevent) => {
              console.log(JSON.stringify(newevent))
              Calendar.addEvent(newevent);
            })
        }
        function testFilter (name) {
            if (typeof(filter) === 'undefined') {
                return false
            } else
            if (filter.classname.length === 0) {
                return false
            } else
            if (filter.classname === "All") {
                return true
            } else
            if (filter.classname === name) {
                return true
            }
            return false
        }
        SalonData.forEach((newevent) => {
          console.log("Salon hours: " + JSON.stringify(newevent))
          console.log("Salon hours: " + JSON.stringify(filter))
          if (testFilter(newevent.title)) {
              newevent.display = "event"
              Calendar.addEvent(newevent);
          }
        })
      });
    }

    function receiveMessage(event) {
      // Check if the message is coming from the expected origin
      console.log("rec mess")
       console.log("origin=[" + JSON.stringify(event) + "]")
       if (event.isTrusted === true) {
          // Process the message data
          var message = event.data;
          console.log("Received message B:", message);
          try {
            const jsonmsg = JSON.parse(message)
            if (jsonmsg.operation === 'createevent') {
                console.log("create: " + message)
                createEvent(jsonmsg.data)
            } else
            if (jsonmsg.operation === "readappointments") {
                console.log("reading appointments: " + message)
                createEvent(jsonmsg.data)
            } else
            if (jsonmsg.operation === "filteravailable") {
                console.log("filter: " + JSON.stringify(jsonmsg))
                createEvent(null, jsonmsg)
            }
          } catch (e) {
            console.log(e.toString())
          }
       }
    }
    function registerForEvents() {
        // Add an event listener for the message event
        window.addEventListener("message", receiveMessage, false)
        console.log("Adding event listener")
        $('.month-button').on("click", ()=> {
            const newdate = getMonth(CurrentDate)
            setCurrentDate(Calendar, newdate)
            pushState(newdate)
        })
    }
    registerForEvents()

    function initializeSwipe() {
        const container = document.getElementById('container');
        const content = document.getElementById('calendar');
        const cloned =  document.getElementById('cloned')
        const denolc =  document.getElementById('denolc')

        denolc.classList.add('calendar-ease')
        denolc.classList.add('slide-out');
        cloned.classList.add('calendar-ease')
        cloned.classList.add('slide-out-right-show');
        content.classList.add('calendar-ease')
        content.classList.add('slide-in')

        let startX = 0;
        let currentX = 0;
        let blockflag = false;

        container.addEventListener('touchstart', function(event) {
          startX = event.touches[0].clientX;
          currentX = startX;
        });

        container.addEventListener('touchmove', function(event) {
          currentX = event.touches[0].clientX;
        });

        //$('#calendar').css("background-color", "blue")
        container.addEventListener('touchend', function(event) {
            if (blockflag) {
                //return;
            }
            blockflag = true

          const swipeDistance = startX - currentX;
          function reset() {
            blockflag = false
            startX = 0;
            currentX = 0;
          }

          if (swipeDistance > 50) {
            $('#cloned').css("visibility", "visible")
            $('#calendar').css("visibility", "visible")
            content.classList.remove('slide-in');
            content.classList.add('slide-out');
            cloned.classList.remove('slide-out-right-show')
            cloned.classList.add('slide-in')
              console.log('Swiped left [' + CalendarCloned + "]")
                switchDay(1)
                setCurrentDate(CalendarCloned, CurrentDate)
                CalendarCloned.render()
              window.setTimeout(()=> {
                $('#calendar').css("visibility", "hidden")
                content.classList.remove('calendar-ease')
                content.classList.add('calendar-quick')
                content.classList.remove('slide-out');
                content.classList.add('slide-in');
                window.setTimeout(()=> {
                    $('#cloned').css("visibility", "hidden")
                    $('#calendar').css("visibility", "visible")
                    Calendar.render()
                    cloned.classList.remove('slide-in')
                    cloned.classList.add('slide-out-right-show');
                    content.classList.remove('calendar-quick')
                    content.classList.add('calendar-ease')
                    reset()
                }, 1)
              }, 500)
          } else if (swipeDistance < -50) {
            $('#denolc').css("visibility", "visible")
            $('#calendar').css("visibility", "visible")
            content.classList.remove('slide-in');
            content.classList.add('slide-out-right-show');
            denolc.classList.remove('slide-out')
            denolc.classList.add('slide-in')
              console.log('Swiped right');
                switchDay(-1)
                setCurrentDate(CalendarDenolc, CurrentDate)
                CalendarDenolc.render()
              window.setTimeout(()=> {
                $('#calendar').css("visibility", "hidden")
                content.classList.remove('calendar-ease')
                content.classList.add('calendar-quick')
                content.classList.remove('slide-out-right-show');
                content.classList.add('slide-in');
                window.setTimeout(()=> {
                   $('#denolc').css("visibility", "hidden")
                   $('#calendar').css("visibility", "visible")
                    Calendar.render()
                    denolc.classList.remove('slide-in');
                    denolc.classList.add('slide-out');
                    content.classList.remove('calendar-quick')
                    content.classList.add('calendar-ease')
                    reset()
                }, 1)
              }, 500)
          }
        });
    }

    function duplicateView(identifier, newid) {
        const originalDiv = document.getElementById(identifier);
        const clonedDiv = originalDiv.cloneNode(true);
        clonedDiv.id = newid;
        clonedDiv.classList.add('duplicated');
        const parentElement = originalDiv.parentElement;
        parentElement.appendChild(clonedDiv);
    }

    function cloneCalendar(calendar) {
        Calendar = calendar
         if (date != null) {
              setCurrentDate(calendar, date)
              //pushState(CurrentDate)
          } else {
              console.log("Default current month.")
              setCurrentDate(calendar, getMonth(calendar.getDate()))
          }
        //duplicateView('calendar', 'cloned')
        //duplicateView('calendar', 'denolc')

        console.log("Before setting alternate cloned calendar.")

        startCalendar('cloned', (calendar)=> {
            console.log("Setting primary cloned calendar. [" + calendar + "]")
            CalendarCloned = calendar
            startCalendar('denolc', (calendar)=> {
                console.log("Setting alternate cloned calendar.")
                CalendarDenolc = calendar

                initializeSwipe()
                Calendar.render()

            })
        })
    }

    function initializeCalendar(name, data) {
        console.log("Initialize calendar: href = [" + window.location.href + "]")
        document.addEventListener('DOMContentLoaded', startCalendar(name, cloneCalendar, data))
    }

    console.log("before initialization.")

    function getSalonHours(name) {
        getServicesObj()
        const LogMgr = LoginManager().getData(
            "data/salon_hours.json",
            (data)=> {
                console.log("new data = " + JSON.stringify(data))
                console.log("Salon hours href=[" + window.location.href + "]")
                initializeCalendar(name, data)
            })
    }
    getSalonHours('calendar')
    //window.setTimeout(getSalonHours('calendar'), 0)
    //initializeCalendar('calendar')

    console.log("Done initialization.")

    return {
        show: function() {
            console.log("Booking manager.")
        },
        create: function (event) {
            console.log("create: " + JSON.stringify(event))
        },
        read: function (id) {
            console.log("read: " + id)
        },
        update: function (event) {
            console.log("update: " + JSON.stringify(event))
        },
        destroy: function (id) {
            console.log("destroy: " + id)
        }
    }
}

