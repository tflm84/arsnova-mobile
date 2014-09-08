/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('ARSnova.view.diagnosis.StatisticsPanel', {
	extend: 'Ext.Container',

	requires: ['Ext.form.Panel', 'Ext.form.FieldSet', 'ARSnova.model.Statistic'],

	config: {
		fullscreen: true,
		title: 'StatisticPanel',
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	/* panels */
	tablePanel: null,
	testy: null,

	/* statistics */
	statistics: null,

	/* toolbar items */
	toolbar: null,
	backButton: null,

	/**
	 * update the statistics table
	 */
	updateDataTask: {
		name: 'update the statistic table',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel.statisticsPanel.updateData();
		},
		interval: 30000
	},

	initialize: function () {
		this.callParent(arguments);

		this.statisticsStore = Ext.create('Ext.data.Store', {
			model: 'ARSnova.model.Statistic'
		}),

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			handler: function () {
				var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel;

				me.animateActiveItem(me.diagnosisPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700,
					scope: this
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.STATISTIC,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.formpanel = Ext.create('Ext.form.Panel', {
			cls: 'standardForm topPadding',
			scrollable: null,

			defaults: {
				xtype: 'button',
				ui: 'normal',
				cls: 'standardListButton',
				disabled: true
			},

			items: [{
					itemId: 'statisticUsersOnline',
					text: 'Users online'
				}, {
					itemId: 'statisticOpenSessions',
					text: Messages.OPEN_SESSIONS
				}, {
					itemId: 'statisticClosedSessions',
					text: Messages.CLOSED_SESSIONS
				}, {
					itemId: 'statisticQuestions',
					text: Messages.QUESTIONS
				}, {
					itemId: 'statisticAnswers',
					text: Messages.ANSWERS
				}]
		});

		this.add([this.toolbar, this.formpanel]);

		this.on('activate', this.onActivate);
		this.on('activate', this.beforeActivate, this, null, 'before');
		this.on('deactivate', this.onDeactivate);
	},

	beforeActivate: function () {
		this.getStatistics();
	},

	onActivate: function () {
		ARSnova.app.taskManager.start(this.updateDataTask);
	},

	onDeactivate: function () {
		ARSnova.app.taskManager.stop(this.updateDataTask);
	},

	setNumbers: function () {
		if (this.statistics != null) {
			this.formpanel.getComponent('statisticUsersOnline').setText('Users online <div style="float:right">' + this.statistics.activeUsers + '</div>');
			this.formpanel.getComponent('statisticOpenSessions').setText(Messages.OPEN_SESSIONS + '<div style="float:right">' + this.statistics.openSessions + '</div>');
			this.formpanel.getComponent('statisticClosedSessions').setText(Messages.CLOSED_SESSIONS + '<div style="float:right">' + this.statistics.closedSessions + '</div>');
			this.formpanel.getComponent('statisticQuestions').setText(Messages.QUESTIONS + '<div style="float:right">' + this.statistics.questions + '</div>');
			this.formpanel.getComponent('statisticAnswers').setText(Messages.ANSWERS + '<div style="float:right">' + this.statistics.answers + '</div>');
			this.formpanel.getComponent('statisticAnswersPerQuestion').setText(Messages.ANSWERS_PER_QUESTION + '<div style="float:right">' + this.statistics.averageAnswersPerQuestion + '</div>');
		}
	},

	/**
	 * get statistics from proxy
	 */
	getStatistics: function () {
		var promise = new RSVP.Promise();
		ARSnova.app.statisticModel.getStatistics({
			success: function (response) {
				var statistics = Ext.decode(response.responseText);

				if (statistics != null) {
					var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel.statisticsPanel;
					me.statistics = statistics;
					me.setNumbers();
				}
				promise.resolve(statistics);
			},
			failure: function (response) {
				console.log('server-side error, countOpenSessions');
				promise.reject();
			}
		});
		return promise;
	},
	updateData: function () {
		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK);
		this.statisticsStore.clearData();
		this.getStatistics().then(hideLoadMask, hideLoadMask); // hide mask on success and on error
	}
});
