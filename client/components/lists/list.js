const { calculateIndex } = Utils;

BlazeComponent.extendComponent({
  // Proxy
  openForm(options) {
    this.childComponents('listBody')[0].openForm(options);
  },

  onCreated() {
    this.newCardFormIsVisible = new ReactiveVar(true);
  },

  onRendered() {
    const boardComponent = this.parentComponent();
    const itemsSelector = '.js-minicard:not(.placeholder, .js-card-composer)';
    const $cards = this.$('.js-minicards');
    $cards.sortable({
      connectWith: '.js-minicards',
      tolerance: 'pointer',
      appendTo: 'body',
      helper(evt, item) {
        const helper = item.clone();
        if (MultiSelection.isActive()) {
          const andNOthers = $cards.find('.js-minicard.is-checked').length - 1;
          if (andNOthers > 0) {
            helper.append($(Blaze.toHTML(HTML.DIV(
              { 'class': 'and-n-other' },
              TAPi18n.__('and-n-other-card', { count: andNOthers })
            ))));
          }
        }
        return helper;
      },
      distance: 7,
      items: itemsSelector,
      scroll: false,
      placeholder: 'minicard-wrapper placeholder',
      start(evt, ui) {
        ui.placeholder.height(ui.helper.height());
        EscapeActions.executeUpTo('popup');
        boardComponent.setIsDragging(true);
      },
      stop(evt, ui) {
        const prevCardDom = ui.item.prev('.js-minicard').get(0);
        const nextCardDom = ui.item.next('.js-minicard').get(0);
        const nCards = MultiSelection.isActive() ? MultiSelection.count() : 1;
        const sortIndex = calculateIndex(prevCardDom, nextCardDom, nCards);
        const listId = Blaze.getData(ui.item.parents('.list').get(0))._id;

        $cards.sortable('cancel');

        if (MultiSelection.isActive()) {
          Cards.find(MultiSelection.getMongoSelector()).forEach((card, i) => {
            card.move(listId, sortIndex.base + i * sortIndex.increment);
          });
        } else {
          const cardDomElement = ui.item.get(0);
          const card = Blaze.getData(cardDomElement);
          card.move(listId, sortIndex.base);
        }
        boardComponent.setIsDragging(false);
      },
    });

    function userIsMember() {
      return Meteor.user() && Meteor.user().isBoardMember();
    }

    // Disable drag-dropping if the current user is not a board member
    this.autorun(() => {
      $cards.sortable('option', 'disabled', !userIsMember());
    });

    // We want to re-run this function any time a card is added.
    this.autorun(() => {
      const currentBoardId = Tracker.nonreactive(() => {
        return Session.get('currentBoard');
      });
      Cards.find({ boardId: currentBoardId }).fetch();
      Tracker.afterFlush(() => {
        $cards.find(itemsSelector).droppable({
          hoverClass: 'draggable-hover-card',
          accept: '.js-member,.js-label',
          drop(event, ui) {
            const cardId = Blaze.getData(this)._id;
            const card = Cards.findOne(cardId);

            if (ui.draggable.hasClass('js-member')) {
              const memberId = Blaze.getData(ui.draggable.get(0)).userId;
              card.assignMember(memberId);
            } else {
              const labelId = Blaze.getData(ui.draggable.get(0))._id;
              card.addLabel(labelId);
            }
          },
        });
      });
    });
  },
}).register('list');
