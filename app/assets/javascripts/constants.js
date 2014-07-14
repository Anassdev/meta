var CONSTANTS = {
  COIN_OWNERSHIP: {
    ACTIONS: {
      ADD_USER: 'addUser',
      REMOVE_USER: 'removeUser',
      UPDATE_USER: 'updateUser'
    },
    EVENTS: {
      USER_ADDED: 'coinOwnership:userAdded',
      USER_REMOVED: 'coinOwnership:userRevmoed',
      USER_UPDATED: 'coinOwnership:userUpdated'
    }
  },

  PERSON_PICKER: {
    ACTIONS: {
      ADD_USER: 'addUser',
      REMOVE_USER: 'removeUser',
      UPDATE_USER: 'updateUser'
    },
    EVENTS: {
      USER_ADDED: 'personPicker:userAdded',
      USER_REMOVED: 'personPicker:userRemoved',
      USER_UPDATED: 'personPicker:userUpdated'
    }
  },

  TAG_LIST: {
    ACTIONS: {
      ADD_TAG: 'addTag',
      REMOVE_TAG: 'removeTag'
    },
    EVENTS: {
      TAG_ADDED: 'textComplete:tagAdded',
      TAG_REMOVED: 'tagList:tagRemoved'
    }
  },

  TEXT_COMPLETE: {
    ACTIONS: {
      SETUP: 'setUpChosen',
      ADD_TAG: 'addTag'
    },
    EVENTS: {
      DID_MOUNT: 'textComplete:didMount',
      TAG_ADDED: 'textComplete:tagAdded'
    }
  }
};
