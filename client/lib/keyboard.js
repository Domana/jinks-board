Mousetrap.bind('?', () => {
  FlowRouter.go('shortcuts');
});

Mousetrap.bind('w', () => {
  Sidebar.toggle();
});

Mousetrap.bind('q', () => {
  const currentBoardId = Session.get('currentBoard');
  const currentUserId = Meteor.userId();
  if (currentBoardId && currentUserId) {
    Filter.members.toggle(currentUserId);
  }
});

Mousetrap.bind('x', () => {
  if (Filter.isActive()) {
    Filter.reset();
  }
});

Mousetrap.bind('f', () => {
  if (Sidebar.isOpen() && Sidebar.getView() === 'filter') {
    Sidebar.toggle();
  } else {
    Sidebar.setView('filter');
  }
});

Mousetrap.bind(['down', 'up'], (evt, key) => {
  if (!Session.get('currentCard')) {
    return;
  }

  const nextFunc = (key === 'down' ? 'next' : 'prev');
  const nextCard = $('.js-minicard.is-selected')[nextFunc]('.js-minicard').get(0);
  if (nextCard) {
    const nextCardId = Blaze.getData(nextCard)._id;
    Utils.goCardId(nextCardId);
  }
});

Mousetrap.bind('space', (evt) => {
  if (!Session.get('currentCard')) {
    return;
  }

  const currentUserId = Meteor.userId();
  if (currentUserId === null) {
    return;
  }

  if (Meteor.user().isBoardMember()) {
    const card = Cards.findOne(Session.get('currentCard'));
    card.toggleMember(currentUserId);
    evt.preventDefault();
  }
});

Template.keyboardShortcuts.helpers({
  mapping: [{
    keys: ['W'],
    action: 'shortcut-toggle-sidebar',
  }, {
    keys: ['Q'],
    action: 'shortcut-filter-my-cards',
  }, {
    keys: ['F'],
    action: 'shortcut-toggle-filterbar',
  }, {
    keys: ['X'],
    action: 'shortcut-clear-filters',
  }, {
    keys: ['?'],
    action: 'shortcut-show-shortcuts',
  }, {
    keys: ['ESC'],
    action: 'shortcut-close-dialog',
  }, {
    keys: ['@'],
    action: 'shortcut-autocomplete-members',
  }, {
    keys: [':'],
    action: 'shortcut-autocomplete-emoji',
  }, {
    keys: ['SPACE'],
    action: 'shortcut-assign-self',
  }],
});
