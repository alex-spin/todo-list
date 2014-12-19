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
		validate: function (attrs) {
			if ( ! $.trim(attrs.title) ) {
				return 'Task name is invalid!';
			}
		}
	});
	// task view
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
			'click .edit': 'editTask',
			'click .delete': 'destroy',
			'click .complete': 'complete'
		},
		editTask: function  () {
			var newTaskTitle = prompt('Как переименуем задачу?', this.model.get('title'));
			this.model.set('title', newTaskTitle, {validate: true});
		},
		remove: function  () {
			this.$el.remove();
		},
		destroy: function  () {
			this.model.destroy();
		},
		complete: function () {
			this.model.set('status', 'complete');
			this.$el.addClass('task-complete');
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
			var newTask = new App.Models.Task({ title: newTaskTitle, status: 'new'});
			if ( $.trim(newTaskTitle) ) {
				this.collection.add(newTask);
			}
		}
	});

	App.Collections.Task = Backbone.Collection.extend({
		model: App.Models.Task
	});
	// collection view
	App.Views.Tasks = Backbone.View.extend({
		tagName: 'ul',
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
			this.collection.on('add', this.addOne, this );
		},
		addOne: function(task) {
			// create new child
			var taskView = new App.Views.Task({ model: task });
			// add child to list
			this.$el.append(taskView.render().el);
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

	window.tasksCollection = new App.Collections.Task([
		{
			title: 'Сходить в магазин',
			status: 'new'
		},
		{
			title: 'Получить почту',
			status: 'new'
		},
		{
			title: 'Сходить на работу',
			status: 'new'
		}
	]);

	var tasksView = new App.Views.Tasks({ collection: tasksCollection});
	var addTaskView = new App.Views.AddTask({ collection: tasksCollection });
	var navView = new App.Views.NavTask({ collection: tasksCollection });

	$('.tasks').html(tasksView.render().el);

});