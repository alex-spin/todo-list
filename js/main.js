$(function() {
	// namespace
	window.App = {
		Models: {},
		Collections: {},
		Views:{}
	};

	// template
	window.template = function(id) {
		return _.template( $('#' + id).html() );
	};

	// task model
	App.Models.Task = Backbone.Model.extend({
		defaults: function() {
			return {
				title: "empty todo...",
				status: 'new'
		}},
		validate: function (attrs) {
			if ( ! $.trim(attrs.title) ) {
				return 'Task name is invalid!';
			}
		}
	});
	// collection sub task
	App.Collections.SubTask = Backbone.Collection.extend({
		model: App.Models.Task
	});
	// List of task
	App.Models.ListTask = Backbone.Model.extend({
		subItems: new App.Collections.SubTask
	});
	// Collection tasks
	App.Collections.Task = Backbone.Collection.extend({
		model: App.Models.ListTask
		//url: 'https://scorching-inferno-4881.firebaseapp.com/todos'
	});


	// task view
	App.Views.SubTask = Backbone.View.extend({
		initialize: function () {
			this.model.on('change', this.render, this);
			this.model.on('destroy', this.remove, this);
		},
		tagName: 'li',
		template: template('subTaskTemplate'),
		render: function () {
			var template = this.template(this.model.toJSON());
			this.$el.html(template);
			if (this.model.get('status', 'complete') == 'complete') {
				this.$el.addClass('task-complete');
			}
			return this;
		},
		events: {
			'dblclick ': 'editTask',
			'click .delete': 'destroy',
			'click .complete': 'complete'
		},
		editTask: function  () {
			var newTaskTitle = prompt('Как переименуем задачу?', this.model.get('title'));
			this.model.set('title', newTaskTitle, {validate: true});
			//this.model.save('title', newTaskTitle, {validate: true});
		},
		remove: function  () {
			this.$el.remove();
		},
		destroy: function  () {
			this.model.destroy();
		},
		complete: function () {
			this.model.set('status', 'complete');
			//this.model.save('status', 'complete');
			this.$el.addClass('task-complete');
		}
	});
	//list tasks view
	App.Views.Task = Backbone.View.extend({
		initialize: function () {
			this.model.on('change', this.render, this);
			this.model.on('destroy', this.remove, this);
		},
		tagName: 'li',
		template: template('taskTemplate'),
		render: function () {
			var template = this.template(this.model.toJSON());
			this.$el.html(template);
			if (this.model.get('status', 'complete') == 'complete') {
				this.$el.addClass('task-complete');
			}
			return this;
		},
		events: {
			'dblclick ': 'editTask',
			'click .delete': 'destroy',
			'click .complete': 'complete',
			'click .sub-task': 'subTaskAdd'
		},
		editTask: function  () {
			var newTaskTitle = prompt('Как переименуем задачу?', this.model.get('title'));
			this.model.set('title', newTaskTitle, {validate: true});
			//this.model.save('title', newTaskTitle, {validate: true});
		},
		remove: function  () {
			this.$el.remove();
		},
		destroy: function  () {
			this.model.destroy();
		},
		complete: function () {
			this.model.set('status', 'complete');
			//this.model.save('status', 'complete');
			this.$el.addClass('task-complete');
		},
		subTaskAdd: function () {
			var newTaskTitle = prompt('Новая подзадача');
			var newTask = new App.Models.Task({ title: newTaskTitle, status: 'new'});
			if ( $.trim(newTaskTitle) ) {
				this.model.subItems.add(newTask);
				console.log(this.model.subItems.toJSON());
				console.log(this.model.subItems);
			}
			console.log(this.model.subItems.add(newTask));
		}
	});

	// add new task
	App.Views.AddTask = Backbone.View.extend({
		el: '#addTask',
		events: {
			'submit' : 'submit'
		},
		initialize: function() {
		},
		submit: function(e) {
			e.preventDefault();
			var newTaskTitle =  $(e.currentTarget).find('input[type=text]').val();
			var newTask = new App.Models.ListTask({ title: newTaskTitle, status: 'new'});
			if ( $.trim(newTaskTitle) ) {
				this.collection.add(newTask);
			}
		}
	});


	// collection view
	App.Views.Tasks = Backbone.View.extend({
		tagName: 'ul',
		events: {

		},
		render: function(params) {
			if (!params) {
				this.collection.each(this.addOne, this);
			} else {
				var choiceM = this.collection.where({'status': params});
				if (choiceM.length !== 0) {
					var self = this;
					this.$el.html('');
					$.each(choiceM, function (){
						self.addOne(this);
					});
				}
			}
			return this;
		},
		initialize: function() {
			this.changeCount();
			//this.collection.fetch();
			this.collection.on('add', this.addOne, this );
			this.collection.on('all', this.changeCount, this );
		},
		addOne: function(task) {
			// create new child
			var taskView = new App.Views.Task({ model: task });
			//taskView.model.save();
			// add child to list
			this.$el.append(taskView.render().el);
		},
		changeCount: function(countAll, countActive, countCompleted) {
			countAll = this.collection.length;
			countActive = (this.collection.where({'status': 'new'})).length;
			countCompleted = (this.collection.where({'status': 'complete'})).length;
			$('.show-all-count span').text(countAll);
			$('.show-active-count span').text(countActive);
			$('.show-completed-count span').text(countCompleted);
		}
	});


	// navigation for task
	App.Views.NavTask = Backbone.View.extend({
		el: '.nav-task',
		events: {
			'click .show-completed' : 'showCompleted',
			'click .show-active' : 'showActive',
			'click .show-all' : 'showAll'
		},
		initialize: function() {
		},
		showCompleted: function() {
			tasksView.render('complete');
		},
		showActive: function() {
			tasksView.render('new');
		},
		showAll: function() {
			tasksView.$el.html('');
			tasksView.render();
		}
	});

	var tasksCollection = new App.Collections.Task();

	var tasksView = new App.Views.Tasks({ collection: tasksCollection});
	var addTaskView = new App.Views.AddTask({ collection: tasksCollection });
	var navView = new App.Views.NavTask({ collection: tasksCollection });

	console.log(tasksCollection);
	$('.tasks').html(tasksView.render().el);

});