let workouts = [];
        let goals = {weekly: 0, calories: 0};
       
        const exList = {
            'Cardio': ['Running', 'Cycling', 'Swimming', 'Walking', 'Jogging', 'Elliptical', 'Jump Rope', 'Rowing', 'Treadmill', 'Stair Climbing'],
            'Strength': ['Weight Lifting', 'Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Bench Press', 'Lunges', 'Planks', 'Dumbbell Curls', 'Leg Press'],
            'Flexibility': ['Yoga', 'Stretching', 'Pilates', 'Tai Chi', 'Dynamic Stretching'],
            'Sports': ['Basketball', 'Football', 'Tennis', 'Badminton', 'Cricket', 'Volleyball', 'Table Tennis', 'Hockey', 'Baseball']
        };
        function init() {
            let saved = localStorage.getItem('workoutData');
            if(saved) workouts = JSON.parse(saved);
           
            let savedGoals = localStorage.getItem('fitnessGoals');
            if(savedGoals) goals = JSON.parse(savedGoals);
           
            document.getElementById('wdate').value = new Date().toISOString().split('T')[0];
            updateExList();
            updateStats();
            updateHistory();
            updateGoalDisplay();
            calcStreak();
        }
        function calcStreak() {
            if(workouts.length === 0) {
                document.getElementById('streakNum').textContent = '0';
                return;
            }
            let dates = workouts.map(w => w.date).sort();
            let uniqueDates = [...new Set(dates)].sort().reverse();
           
            let streak = 0;
            let today = new Date();
            today.setHours(0,0,0,0);
           
            for(let i = 0; i < uniqueDates.length; i++) {
                let d = new Date(uniqueDates[i]);
                d.setHours(0,0,0,0);
                let diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
               
                if(diff === streak) {
                    streak++;
                } else {
                    break;
                }
            }
           
            document.getElementById('streakNum').textContent = streak;
        }
        function updateExList() {
            let cat = document.getElementById('cat').value;
            let sel = document.getElementById('extype');
            sel.innerHTML = '';
            exList[cat].forEach(ex => {
                let opt = document.createElement('option');
                opt.value = ex;
                opt.textContent = ex;
                sel.appendChild(opt);
            });
        }
        function showTab(tab, button) {
            let tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(t => t.classList.add('hidden'));
            document.getElementById(tab).classList.remove('hidden');
           
            let btns = document.querySelectorAll('.tab');
            btns.forEach(b => b.classList.remove('active'));
            if(button) button.classList.add('active');
           
            if(tab === 'stats') updateStats();
            if(tab === 'history') updateHistory();
            if(tab === 'goals') updateGoalDisplay();
        }
        function addWorkout() {
            let date = document.getElementById('wdate').value;
            let cat = document.getElementById('cat').value;
            let ex = document.getElementById('extype').value;
            let dur = parseInt(document.getElementById('dur').value);
            let unit = document.getElementById('unit').value;
            let cal = parseInt(document.getElementById('cal').value);
            let wt = document.getElementById('wt').value;
            let sets = document.getElementById('sets').value;
            let notes = document.getElementById('notes').value;
            if(!date || !dur || !cal || !ex) {
                alert('Please fill required fields: Date, Exercise, Duration, Calories!');
                return;
            }
            let durMin = unit === 'hours' ? dur * 60 : dur;
            let workout = {
                id: Date.now(),
                date: date,
                category: cat,
                exercise: ex,
                duration: durMin,
                calories: cal,
                weight: wt,
                sets: sets,
                notes: notes
            };
            workouts.push(workout);
            localStorage.setItem('workoutData', JSON.stringify(workouts));
           
            calcStreak();
            alert('Workout added! Keep the streak going! 🔥');
            document.getElementById('dur').value = '';
            document.getElementById('cal').value = '';
            document.getElementById('wt').value = '';
            document.getElementById('sets').value = '';
            document.getElementById('notes').value = '';
        }
        function deleteWorkout(id) {
            if(confirm('Delete this workout?')) {
                workouts = workouts.filter(w => w.id !== id);
                localStorage.setItem('workoutData', JSON.stringify(workouts));
                updateHistory();
                updateStats();
                calcStreak();
            }
        }
        function clearData() {
            if(confirm('Delete all workouts? This cannot be undone!')) {
                workouts = [];
                localStorage.setItem('workoutData', JSON.stringify(workouts));
                updateHistory();
                updateStats();
                calcStreak();
            }
        }
        function updateStats() {
            let period = document.getElementById('filterPeriod').value;
            let cat = document.getElementById('filterCat').value;
           
            let filtered = workouts.filter(w => {
                let match = true;
                if(cat !== 'all' && w.category !== cat) match = false;
                if(period !== 'all') {
                    let wDate = new Date(w.date);
                    wDate.setHours(0,0,0,0);
                    let now = new Date();
                    now.setHours(0,0,0,0);
                    let diff = Math.floor((now - wDate) / (1000 * 60 * 60 * 24));
                    if(diff > parseInt(period)) match = false;
                }
                return match;
            });
            let total = filtered.length;
            let totalMin = 0;
            let totalCal = 0;
            filtered.forEach(w => {
                totalMin += w.duration;
                totalCal += w.calories;
            });
            let avgDur = total > 0 ? Math.round(totalMin / total) : 0;
            let exCount = {};
            filtered.forEach(w => {
                exCount[w.exercise] = (exCount[w.exercise] || 0) + 1;
            });
            let fav = total > 0 ? Object.keys(exCount).reduce((a, b) => exCount[a] > exCount[b] ? a : b, '') : '-';
            
            let now = new Date();
            now.setHours(0,0,0,0);
            let weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            let thisWeek = workouts.filter(w => {
                let wDate = new Date(w.date);
                wDate.setHours(0,0,0,0);
                return wDate >= weekAgo;
            }).length;
            
            document.getElementById('s1').textContent = total;
            document.getElementById('s2').textContent = totalMin;
            document.getElementById('s3').textContent = totalCal;
            document.getElementById('s4').textContent = avgDur;
            document.getElementById('s5').textContent = thisWeek;
            document.getElementById('s6').textContent = fav;
        }
        function updateHistory() {
            let tbody = document.getElementById('histTable');
            tbody.innerHTML = '';
            let sorted = [...workouts].sort((a,b) => new Date(b.date) - new Date(a.date));
            sorted.forEach(w => {
                let row = tbody.insertRow();
                let badgeClass = `badge-${w.category.toLowerCase().replace(' ', '-')}`;
                let details = [];
                if(w.sets) details.push(w.sets);
                if(w.weight) details.push(w.weight + 'kg');
                if(w.notes) details.push(w.notes);
                row.innerHTML = `
                    <td>${w.date}</td>
                    <td><span class="badge ${badgeClass}">${w.category}</span></td>
                    <td>${w.exercise}</td>
                    <td>${w.duration} min</td>
                    <td>${w.calories}</td>
                    <td>${details.join(' | ')}</td>
                    <td><button class="btn btn-delete" onclick="deleteWorkout(${w.id})">Delete</button></td>
                `;
            });
        }
        function saveGoal() {
            goals.weekly = parseInt(document.getElementById('goalWk').value) || 0;
            goals.calories = parseInt(document.getElementById('goalCal').value) || 0;
            localStorage.setItem('fitnessGoals', JSON.stringify(goals));
            updateGoalDisplay();
        }
        function updateGoalDisplay() {
            document.getElementById('goalWk').value = goals.weekly;
            document.getElementById('goalCal').value = goals.calories;
            
            let now = new Date();
            now.setHours(0,0,0,0);
            let weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            let weekWorkouts = workouts.filter(w => {
                let wd = new Date(w.date);
                wd.setHours(0,0,0,0);
                return wd >= weekStart;
            });
            let weekCount = weekWorkouts.length;
            let weekCalTotal = weekWorkouts.reduce((sum, w) => sum + w.calories, 0);
            
            let prog1 = goals.weekly > 0 ? Math.min(100, (weekCount / goals.weekly * 100)) : 0;
            let prog2 = goals.calories > 0 ? Math.min(100, (weekCalTotal / goals.calories * 100)) : 0;
            
            let bar1 = document.getElementById('goalBar1');
            bar1.style.width = prog1 + '%';
            bar1.textContent = Math.round(prog1) + '%';
            document.getElementById('goalText1').textContent = `${weekCount}/${goals.weekly} workouts`;
            
            let bar2 = document.getElementById('goalBar2');
            bar2.style.width = prog2 + '%';
            bar2.textContent = Math.round(prog2) + '%';
            document.getElementById('goalText2').textContent = `${weekCalTotal}/${goals.calories} kcal`;
        }
        function calcBMI() {
            let wt = parseFloat(document.getElementById('bmiWt').value);
            let ht = parseFloat(document.getElementById('bmiHt').value) / 100;
            if(!wt || !ht) {
                alert('Enter weight and height');
                return;
            }
            let bmi = wt / (ht * ht);
            let result = document.getElementById('bmiResult');
            let cat = '';
            if(bmi < 18.5) cat = 'Underweight';
            else if(bmi < 25) cat = 'Normal';
            else if(bmi < 30) cat = 'Overweight';
            else cat = 'Obese';
            result.innerHTML = `
                <div class="bmi-result-box">
                    <div class="bmi-value">${bmi.toFixed(1)}</div>
                    <p>Category: ${cat}</p>
                </div>
            `;
        }
        init();
