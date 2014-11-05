(function () {

    window.aero = window.aero || {};

    if (Object.observe) {
        var registerObservable = function (name, obs) {
            if (_.isArray(obs)) {
                var count = 0;
                var updateArray = function () {
                    var element = $('*[data-observable-array="' + name + '"]');
                    var templateUrl = element.attr('data-observable-template');
                    window.aero.templateManager.get(templateUrl, function (template) {
                        var tmp = '';
                        for (var i = 0; i < obs.length; i++) {
                            tmp += _.template(template, obs[i]);
                        }
                        element.html(tmp);
                    });
                };
                updateArray();
                Array.observe(obs, function (changeRecords) {
                    count++;
                    updateArray();
                });
            }
            else if (_.isObject(obs)) {
                var updateValue = function (type, nameValue, oldValue, value) {
                    if (type === 'update') {
                        if (obs._type && obs._type === 'input') {
                            $('*[data-observable-input]').val(value);
                        }
                        else if (oldValue !== value) {
                            $('*[data-observable-value="' + name + '.' + nameValue + '"]').html(value);
                        }
                    }
                };
                for (var key in obs) {
                    updateValue('update', key, '', obs[key]);
                }
                Object.observe(obs, function (changes) {
                    changes.forEach(function (change) {
                        updateValue(change.type, change.name, change.oldValue, change.object[change.name]);
                    });
                });
            }
        };
        window.aero._initObservables = function (view) {
            view.observables = {};
            var observablesInput = $('*[data-observable-input]');
            for (var i = 0; i < observablesInput.length; i++) {
                view.observables[observablesInput[i].name] = {value: observablesInput[i].value, _type: 'input'};
            }
            observablesInput.off('keyup');
            observablesInput.on('keyup', function (e) {
                var element = e.currentTarget;
                view.observables[element.name].value = element.value;
            });
            Object.observe(view.observables, function (changes) {
                changes.forEach(function (change) {
                    if (change.type === 'add') {
                        registerObservable(change.name, change.object[change.name]);
                    }
                });
            });
        }
    }

})();
