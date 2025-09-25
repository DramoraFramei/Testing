/* This is the Library script for the AI Dungeon script called "Testing" */
// The AI Dungeon API is documented at
// https://help.aidungeon.com/faq/how-do-i-write-scripts-and-use-scripting#block-1047d9f6df2a4b3cb703401a8782ac5e

// This Script Library is used to provide common functions for the Testing
// script. It is not intended to be used on its own. It is included with the
// Testing Input, Testing Context, and Testing Output scripts.

// The functions in this library are used to do the following:
// - Create a Settings Story Card for the Testing script called "Script
//   Settings Story Card" that allows the user to configure the script's
//   behavior and settings.
// - Provide utility functions for the Testing script to use. including:
//   - A function to get the Story Cards that are currently in the story under
//     the Lists type.
//   - A function to get the text from those Story Cards
//   - A function to get the text from the story that is encased inside "#-- --#"
//   - A function to automatically detect and add relevant information to the
//     Lists Story Cards based on the text that was just gathered from the
//     story.
//   - A function to remove duplicate entries from the Lists Story Cards.
//   - A function to remove the "#-- --#" markers from the story text.
//   - A function to detect if the Lists Story Cards have reached their maximum
//     capacity and if so, add a new Lists Story Card to the story with a number
//     appended to the end of its name than the previous Lists Story Card while
//     ensuring that the new name is otherwise the same as the previous Lists
//     Story Card. This is to ensure that the Testing script can continue to add
//     information to the Lists Story Cards without running into the maximum
//     capacity limit of the Lists Story Card. the maximum capacity of a story
//     card is 2000 characters.
//   - A function to Create a new character type Story Card for each character
//     added to specific Lists Story Cards. This is to ensure that the Testing
//     script can create character profiles for each character that is added to
//     the Lists Story Cards. The character profiles are created based on the
//     information that is already present in the Lists Story Cards. The
//     character profiles are created with a name that is the same as the name
//     of the character in the Lists Story Card. The character profiles are
//     created with a description that is based on the information that is
//     added to the story by the user using "#-- --#" markers. The character
//     profiles are created with a type that is "Character".
// - A function to get the names of all characters in the story that have a
//   character type Story Card.
// - A function to check if a character profile already exists for a character
//   and if not, create one using the information from the Lists Story Cards.
// - A function to update the description of an existing character profile with
//   new information from the story if the new information is not
//   already present in the character profile.
// - A function to update the script if there are any changes to the Script
//   Settings Story Card.
// - A function to log the actions taken by the Testing script for debugging
//   purposes.
// - A function to handle errors and exceptions that may occur during the
//   execution of the Testing script.
// - A function to reset the Testing script to its default settings and state.
// - A function to provide a user interface for configuring the Testing script.
// - A function to provide help and documentation for using the Testing script.

// The functions to initialize and run the Testing script library
function Testing(inHook, inText, inStop) {
	'use strict';

	console.log(
		`[Testing] Function called with hook: ${inHook}, text length: ${
			(inText || '').length
		}, stop: ${inStop}`
	);

	// Safety check for AI Dungeon environment
	if (typeof state === 'undefined') {
		console.log('[Testing] ERROR: state is undefined, returning safely');
		// Can't use console in AI Dungeon, just return safely
		return inText || '';
	}

	/*
    Default Testing Script settings
    Feel free to change these settings to customize your scenario's default gameplay experience
    */

	// Is Testing script already enabled when the adventure begins?
	const DEFAULT_ENABLED = true;

	// Pin the "Script Settings Story Card" at the top of the player's story cards list?
	const DEFAULT_PIN_SETTINGS_CARD = true;

	// Automatically detect and add information to Lists Story Cards?
	const DEFAULT_AUTO_DETECT = true;

	// Maximum character limit for story cards before creating new ones
	const DEFAULT_CARD_LIMIT = 2000;

	// Automatically create character profiles from Lists Story Cards?
	const DEFAULT_AUTO_CHARACTERS = true;

	// Remove duplicate entries from Lists Story Cards?
	const DEFAULT_REMOVE_DUPLICATES = true;

	// Enable debug logging?
	const DEFAULT_DEBUG_MODE = true;

	// Default story card type for Lists
	const DEFAULT_LIST_CARD_TYPE = 'Lists';

	// Default story card type for Characters
	const DEFAULT_CHARACTER_CARD_TYPE = 'character';

	//—————————————————————————————————————————————————————————————————————————————————

	// Hook constants and validation
	const HOOK = inHook;
	const TEXT = (typeof inText === 'string' && inText) || '\n';
	const STOP = inStop === true;

	console.log(
		`[Testing] Hook: ${HOOK}, Text: "${TEXT.substring(
			0,
			50
		)}...", Stop: ${STOP}`
	);

	// Initialize the Testing script state
	console.log('[Testing] Initializing Testing script state...');
	const TS = getTestingState();
	console.log(`[Testing] State initialized. Enabled: ${TS.config.enabled}`);

	// Main script processing
	if (!HOOK) {
		console.log('[Testing] No hook provided, returning API interface');
		// Return API interface when called without arguments
		return getAPI();
	}

	try {
		console.log(`[Testing] Processing hook: ${HOOK}`);
		switch (HOOK) {
			case 'input':
				console.log('[Testing] Calling processInput...');
				return processInput(TEXT);
			case 'context':
				console.log('[Testing] Calling processContext...');
				return processContext(TEXT, STOP);
			case 'output':
				console.log('[Testing] Calling processOutput...');
				return processOutput(TEXT);
			default:
				console.log(
					`[Testing] Unknown hook ${HOOK}, calling processDefault...`
				);
				return processDefault(TEXT, STOP);
		}
	} catch (error) {
		console.log(`[Testing] ERROR in ${HOOK} hook:`, error);
		logError('Testing script error in ' + HOOK + ' hook', error);
		return TEXT;
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Core Functions

	function getTestingState() {
		console.log('[Testing] getTestingState() called');

		// Try to get existing state from various locations
		if (state.Testing) {
			console.log('[Testing] Found existing state in state.Testing');
			const ts = state.Testing;
			delete state.Testing;
			return ts;
		}

		// Look for settings card to restore state
		console.log('[Testing] Checking for settings card to restore state...');
		const settingsCard = getSettingsCard();
		if (settingsCard) {
			console.log(
				'[Testing] Settings card found, attempting to parse saved state'
			);
			try {
				const savedState = JSON.parse(settingsCard.description || '{}');
				if (validateState(savedState)) {
					console.log(
						'[Testing] Successfully restored state from settings card'
					);
					return savedState;
				}
				console.log('[Testing] Saved state validation failed');
			} catch (e) {
				console.log('[Testing] Error parsing saved state:', e);
				logDebug('Could not parse saved state from settings card');
			}
		} else {
			console.log('[Testing] No settings card found');
		}

		// Return default state
		console.log('[Testing] Returning default state');
		return {
			config: {
				enabled: DEFAULT_ENABLED,
				pinSettingsCard: DEFAULT_PIN_SETTINGS_CARD,
				autoDetect: DEFAULT_AUTO_DETECT,
				cardLimit: DEFAULT_CARD_LIMIT,
				autoCharacters: DEFAULT_AUTO_CHARACTERS,
				removeDuplicates: DEFAULT_REMOVE_DUPLICATES,
				debugMode: DEFAULT_DEBUG_MODE,
				listCardType: DEFAULT_LIST_CARD_TYPE,
				characterCardType: DEFAULT_CHARACTER_CARD_TYPE
			},
			lastProcessedAction: -1,
			processedMarkers: new Set(),
			createdCharacters: new Set(),
			initializedFromCharacterSheet: false,
			logs: []
		};
	}

	function validateState(obj) {
		return (
			obj &&
			typeof obj === 'object' &&
			obj.config &&
			typeof obj.config === 'object'
		);
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Hook Processing Functions

	function processInput(text) {
		console.log(
			`[Testing] processInput() called with text: "${text.substring(
				0,
				100
			)}..."`
		);
		console.log(`[Testing] Script enabled: ${TS.config.enabled}`);

		if (!TS.config.enabled) {
			console.log('[Testing] Script disabled, returning original text');
			return text;
		}

		// Process any commands in input
		console.log('[Testing] Processing commands in input...');
		text = processCommands(text);
		console.log(
			`[Testing] After command processing: "${text.substring(0, 100)}..."`
		);

		console.log('[Testing] processInput() completed');
		return text;
	}

	function processContext(text, stop) {
		console.log(
			`[Testing] processContext() called with text length: ${text.length}, stop: ${stop}`
		);
		console.log(`[Testing] Script enabled: ${TS.config.enabled}`);

		if (!TS.config.enabled) {
			console.log(
				'[Testing] Script disabled, checking for settings card...'
			);
			// Even if disabled, try to create settings card once
			if (!getSettingsCard()) {
				console.log(
					'[Testing] No settings card found, creating one...'
				);
				createSettingsCard();
			} else {
				console.log('[Testing] Settings card already exists');
			}
			console.log('[Testing] processContext() completed (disabled)');
			return [text, stop];
		}

		// Create settings card if it doesn't exist
		console.log('[Testing] Ensuring settings card exists...');
		ensureSettingsCard();

		// Initialize Lists from Character Sheet on first run
		console.log('[Testing] Initializing lists from character sheet...');
		initializeListsFromCharacterSheet();

		// Save current state
		console.log('[Testing] Saving current state...');
		saveState();

		console.log('[Testing] processContext() completed');
		return [text, stop];
	}

	function processOutput(text) {
		console.log(
			`[Testing] processOutput() called with text length: ${text.length}`
		);
		console.log(`[Testing] Script enabled: ${TS.config.enabled}`);

		if (!TS.config.enabled) {
			console.log('[Testing] Script disabled, returning original text');
			return text;
		}

		// Extract information from markers
		console.log('[Testing] Extracting marked text...');
		const extractedInfo = extractMarkedText(text);
		console.log(
			`[Testing] Found ${extractedInfo.length} marked text items:`,
			extractedInfo
		);

		if (extractedInfo.length > 0) {
			// Process extracted information
			console.log('[Testing] Processing extracted information...');
			processExtractedInfo(extractedInfo);

			// Remove markers from output if configured
			console.log('[Testing] Removing markers from text...');
			text = removeMarkers(text);
		}

		console.log('[Testing] processOutput() completed');
		return text;
	}

	function processDefault(text, stop) {
		// Handle initialization and null hooks
		if (HOOK === null) {
			// Clean up context text similar to AC Library
			text = cleanContextText(text);
		}

		return [text, stop];
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Settings Story Card Functions

	function ensureSettingsCard() {
		console.log('[Testing] ensureSettingsCard() called');

		// Always create a new settings card first
		console.log('[Testing] Creating new settings card...');
		const newSettingsCard = createSettingsCard();

		// Now check for any existing settings cards and remove duplicates
		console.log('[Testing] Checking for duplicate settings cards...');
		const allSettingsCards = getAllSettingsCards();

		if (allSettingsCards.length > 1) {
			console.log(
				`[Testing] Found ${allSettingsCards.length} settings cards, removing duplicates...`
			);

			// Sort cards by creation timestamp (newest first), fallback to the newest created card
			allSettingsCards.sort((a, b) => {
				const timeA = a.created ? new Date(a.created).getTime() : 0;
				const timeB = b.created ? new Date(b.created).getTime() : 0;
				return timeB - timeA; // Sort descending (newest first)
			});

			// Keep the newest card (first in sorted array) and remove the others
			const cardToKeep = allSettingsCards[0];
			const cardsToRemove = allSettingsCards.slice(1);

			console.log(
				`[Testing] Keeping newest card: "${
					cardToKeep.title
				}" (created: ${cardToKeep.created || 'no timestamp'})`
			);
			console.log(
				`[Testing] Removing ${cardsToRemove.length} older duplicate settings cards`
			);

			cardsToRemove.forEach((cardToRemove, index) => {
				const cardIndex = state.storyCards.indexOf(cardToRemove);
				if (cardIndex !== -1) {
					console.log(
						`[Testing] Removing duplicate card ${index + 1}: "${
							cardToRemove.title
						}" (created: ${
							cardToRemove.created || 'no timestamp'
						}) at index ${cardIndex}`
					);
					state.storyCards.splice(cardIndex, 1);
				} else {
					console.log(
						`[Testing] WARNING: Could not find card "${cardToRemove.title}" in storyCards array`
					);
				}
			});

			console.log(
				`[Testing] Removed ${cardsToRemove.length} duplicate settings cards`
			);
		} else {
			console.log('[Testing] No duplicate settings cards found');
		}

		// Verify the card was successfully created and is accessible
		console.log('[Testing] Verifying settings card creation...');
		const verifyCard = getSettingsCard();

		if (verifyCard) {
			console.log('[Testing] Settings card verification successful');
			console.log('[Testing] Updating settings card...');
			updateSettingsCard(verifyCard);

			if (TS.config.pinSettingsCard) {
				console.log('[Testing] Pinning settings card to top...');
				pinCardToTop(verifyCard);
			}
		} else {
			console.log(
				'[Testing] ERROR: Settings card verification failed - card not found after creation'
			);
			console.log(
				'[Testing] Current storyCards:',
				state.storyCards
					? state.storyCards.map((c) => ({
							title: c.title,
							type: c.type
					  }))
					: 'none'
			);
		}

		console.log('[Testing] ensureSettingsCard() completed');
	}

	function getAllSettingsCards() {
		console.log('[Testing] getAllSettingsCards() called');
		if (!state.storyCards) {
			console.log('[Testing] No storyCards array exists');
			return [];
		}

		const settingsCards = state.storyCards.filter(
			(card) =>
				card.title === 'Testing Script Settings' ||
				card.title === 'Script Settings Story Card' ||
				(card.keys && card.keys.includes('testing')) ||
				(card.entry &&
					card.entry.includes('Testing Script Configuration'))
		);

		console.log(`[Testing] Found ${settingsCards.length} settings cards:`);
		settingsCards.forEach((card, index) => {
			console.log(
				`[Testing]   Card ${index + 1}: "${card.title}" (created: ${
					card.created || 'no timestamp'
				})`
			);
		});

		return settingsCards;
	}

	function getSettingsCard() {
		console.log('[Testing] getSettingsCard() called');
		console.log('[Testing] state.storyCards exists:', !!state.storyCards);
		console.log(
			'[Testing] storyCards count:',
			state.storyCards ? state.storyCards.length : 0
		);

		if (state.storyCards && state.storyCards.length > 0) {
			console.log(
				'[Testing] Current story cards:',
				state.storyCards.map((card) => ({
					title: card.title,
					type: card.type,
					visible: card.visible,
					isVisible: card.isVisible,
					keys: card.keys
				}))
			);
		}

		const result = state.storyCards?.find(
			(card) =>
				card.title === 'Testing Script Settings' ||
				card.title === 'Script Settings Story Card' ||
				(card.keys && card.keys.includes('testing')) ||
				(card.entry &&
					card.entry.includes('Testing Script Configuration'))
		);

		console.log('[Testing] Found settings card:', !!result);
		return result;
	}

	function createSettingsCard() {
		console.log('[Testing] createSettingsCard() called');

		// Ensure storyCards array exists
		if (!state.storyCards) {
			console.log(
				'[Testing] state.storyCards was null/undefined, creating empty array'
			);
			state.storyCards = [];
		}
		console.log(
			'[Testing] storyCards count before creation:',
			state.storyCards.length
		);

		// Create the card using AI Dungeon's standard format
		const cardEntry = generateSettingsCardEntry();
		const timestamp = new Date().toISOString();
		const settingsCard = {
			title: 'Testing Script Settings',
			type: 'text', // Use standard 'text' type that AI Dungeon recognizes
			keys: 'testing,script,settings,config',
			entry: cardEntry,
			description: JSON.stringify(TS),
			isVisible: true,
			created: timestamp // Add timestamp to identify newer cards
		};

		console.log('[Testing] Created settings card object:', {
			title: settingsCard.title,
			type: settingsCard.type,
			keys: settingsCard.keys,
			entryLength: settingsCard.entry ? settingsCard.entry.length : 0,
			descriptionLength: settingsCard.description
				? settingsCard.description.length
				: 0,
			isVisible: settingsCard.isVisible,
			created: settingsCard.created
		});

		// Ensure the storyCards array exists before pushing
		if (!Array.isArray(state.storyCards)) {
			console.log(
				'[Testing] state.storyCards is not an array, creating new array'
			);
			state.storyCards = [];
		}

		state.storyCards.push(settingsCard);
		console.log('[Testing] Pushed settings card to storyCards array');
		console.log(
			'[Testing] storyCards count after creation:',
			state.storyCards.length
		);

		// Log the final state of all story cards
		console.log(
			'[Testing] All story cards after creation:',
			state.storyCards.map((card) => ({
				title: card.title,
				type: card.type,
				isVisible: card.isVisible,
				hasEntry: !!card.entry,
				hasDescription: !!card.description,
				keys: card.keys
			}))
		);

		logDebug('Created Script Settings Story Card');

		// Try to notify the user that the card was created
		try {
			if (typeof state.message !== 'undefined') {
				console.log(
					'[Testing] Setting state.message for user feedback'
				);
				state.message =
					'Testing Script initialized! Settings card created.';
			} else {
				console.log(
					'[Testing] state.message is undefined, cannot set feedback message'
				);
			}
		} catch (error) {
			console.log('[Testing] Error setting message:', error);
		}

		console.log('[Testing] createSettingsCard() completed');
		return settingsCard;
	}

	function updateSettingsCard(card) {
		console.log('[Testing] updateSettingsCard() called');
		if (!card) {
			console.log('[Testing] No card provided to update');
			return;
		}

		console.log('[Testing] Updating card entry and description...');
		card.entry = generateSettingsCardEntry();
		card.description = JSON.stringify(TS);
		console.log(
			'[Testing] Card updated - entry length:',
			card.entry ? card.entry.length : 0
		);
		console.log(
			'[Testing] Card updated - description length:',
			card.description ? card.description.length : 0
		);
	}

	function generateSettingsCardEntry() {
		return `Testing Script Configuration

Current Settings:
• Enabled: ${TS.config.enabled}
• Auto-detect Information: ${TS.config.autoDetect}  
• Auto-create Characters: ${TS.config.autoCharacters}
• Remove Duplicates: ${TS.config.removeDuplicates}
• Debug Mode: ${TS.config.debugMode}
• Card Limit: ${TS.config.cardLimit} characters

Usage:
Place information between #-- --# markers in your story to automatically add it to relevant Lists Story Cards.

Commands:
• /testing enable - Enable the script
• /testing disable - Disable the script  
• /testing reset - Reset to default settings
• /testing help - Show help information
• /testing debug - Toggle debug mode

This card is automatically managed by the Testing script.`;
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Character Sheet Initialization Functions

	function initializeListsFromCharacterSheet() {
		console.log('[Testing] initializeListsFromCharacterSheet() called');

		// Only initialize once per game session
		if (TS.initializedFromCharacterSheet) {
			console.log(
				'[Testing] Already initialized from character sheet, skipping'
			);
			return;
		}

		console.log('[Testing] Looking for Character Sheet card...');
		let characterSheet;
		try {
			characterSheet = getCharacterSheetCard();
		} catch (error) {
			console.log('[Testing] Error getting character sheet card:', error);
			logDebug('Error getting character sheet: ' + error.message);
			return;
		}

		if (!characterSheet) {
			console.log(
				'[Testing] No Character Sheet card found, skipping initialization'
			);
			logDebug('No Character Sheet card found, skipping initialization');
			return;
		}
		console.log(
			'[Testing] Found Character Sheet card:',
			characterSheet.title || 'untitled'
		);

		console.log(
			'[Testing] Extracting subordinates from Character Sheet...'
		);
		let subordinates;
		try {
			subordinates =
				extractSubordinatesFromCharacterSheet(characterSheet);
			console.log('[Testing] Extracted subordinates:', subordinates);
		} catch (error) {
			console.log('[Testing] Error extracting subordinates:', error);
			logDebug('Error extracting subordinates: ' + error.message);
			return;
		}

		if (subordinates && subordinates.length > 0) {
			console.log(
				`[Testing] Found ${
					subordinates.length
				} subordinates to initialize: ${subordinates.join(', ')}`
			);
			logDebug(
				`Found ${
					subordinates.length
				} subordinates to initialize: ${subordinates.join(', ')}`
			);

			console.log('[Testing] Finding or creating servants list card...');
			const servantsListCard = findOrCreateServantsListCard();
			console.log('[Testing] Initializing servants in list...');
			initializeServantsInList(servantsListCard, subordinates);

			// Create character profiles for each servant if auto-characters is enabled
			if (TS.config.autoCharacters) {
				console.log(
					'[Testing] Auto-characters enabled, creating character cards...'
				);
				subordinates.forEach((name) => {
					console.log(
						`[Testing] Creating character card for: ${name.trim()}`
					);
					createCharacterCard(
						name.trim(),
						`Servant of ${getPlayerName(characterSheet)}`
					);
					TS.createdCharacters.add(name.trim());
				});
			} else {
				console.log(
					'[Testing] Auto-characters disabled, skipping character card creation'
				);
			}

			TS.initializedFromCharacterSheet = true;
			console.log(
				'[Testing] Successfully initialized servants from Character Sheet'
			);
			logDebug('Successfully initialized servants from Character Sheet');
		} else {
			console.log('[Testing] No subordinates found to initialize');
		}
		console.log('[Testing] initializeListsFromCharacterSheet() completed');
	}

	function getCharacterSheetCard() {
		console.log('[Testing] getCharacterSheetCard() called');
		if (!state.storyCards) {
			console.log('[Testing] No storyCards array found');
			return null;
		}

		console.log(
			'[Testing] Searching through',
			state.storyCards.length,
			'story cards for Character Sheet'
		);

		// Look for Character Sheet card by different criteria
		const characterSheet = state.storyCards.find((card) => {
			// Check if it's explicitly a Character Sheet type
			if (card.type === 'Character Sheet') {
				console.log(
					'[Testing] Found card with type "Character Sheet":',
					card.title
				);
				return true;
			}

			// Check if the content contains character sheet fields
			const content = card.value || card.entry || '';
			if (
				content.includes('Subordinate(s):') ||
				(content.includes('Name:') && content.includes('Gender:'))
			) {
				console.log(
					'[Testing] Found card with character sheet content:',
					card.title
				);
				return true;
			}

			// Check for common character sheet titles
			if (
				card.title &&
				(card.title.toLowerCase().includes('character sheet') ||
					card.title === '`${Your First Name And Last Name}`' ||
					card.title.includes('Dramora')) // Based on the log, the character name is Dramora
			) {
				console.log(
					'[Testing] Found card with character sheet title:',
					card.title
				);
				return true;
			}

			return false;
		});

		if (characterSheet) {
			console.log(
				'[Testing] Character Sheet card found:',
				characterSheet.title,
				'type:',
				characterSheet.type
			);
		} else {
			console.log('[Testing] No Character Sheet card found');
			console.log(
				'[Testing] Available cards:',
				state.storyCards.map((card) => ({
					title: card.title,
					type: card.type
				}))
			);
		}

		return characterSheet;
	}

	function extractSubordinatesFromCharacterSheet(card) {
		console.log('[Testing] extractSubordinatesFromCharacterSheet() called');
		const text = card.value || card.entry || '';
		console.log('[Testing] Character sheet text length:', text.length);
		console.log('[Testing] Looking for Subordinate(s): field...');

		// Look for the Subordinate(s) line
		const subordinateMatch = text.match(/Subordinate\(s\):\s*([^\n\r]+)/i);
		if (!subordinateMatch) {
			console.log(
				'[Testing] No Subordinate(s): field found in character sheet'
			);
			return [];
		}

		const subordinatesText = subordinateMatch[1].trim();
		console.log('[Testing] Found subordinates text:', subordinatesText);

		// Skip if it's still a placeholder
		if (
			subordinatesText.includes('${') ||
			subordinatesText.includes('(') ||
			!subordinatesText
		) {
			console.log(
				'[Testing] Subordinates text contains placeholders or is empty, skipping'
			);
			return [];
		}

		// Split by comma and clean up names
		const subordinates = subordinatesText
			.split(',')
			.map((name) => name.trim())
			.filter((name) => name.length > 0);

		console.log('[Testing] Processed subordinates:', subordinates);
		return subordinates;
	}

	function getPlayerName(characterSheet) {
		console.log('[Testing] getPlayerName() called');
		const text = characterSheet.value || characterSheet.entry || '';
		console.log('[Testing] Character sheet text length:', text.length);
		console.log('[Testing] Looking for Name field in character sheet...');

		const nameMatch = text.match(/Name:\s*([^\n\r]+)/i);
		if (nameMatch) {
			let playerName = nameMatch[1].trim();
			console.log('[Testing] Found name match:', playerName);
			// Remove placeholder syntax if present
			if (playerName.includes('${')) {
				console.log(
					'[Testing] Name contains placeholder, returning "the Master"'
				);
				return 'the Master';
			}
			console.log('[Testing] Returning player name:', playerName);
			return playerName;
		}
		console.log('[Testing] No name match found, returning "the Master"');
		return 'the Master';
	}

	function findOrCreateServantsListCard() {
		// Look for existing servants list card
		const existingCard = state.storyCards?.find(
			(card) =>
				card.type === 'Lists' &&
				(card.title.toLowerCase().includes('servant') ||
					(card.value && card.value.includes('{Servant')))
		);

		if (existingCard) {
			return existingCard;
		}

		// Create new servants list card with the exact format from the scenario
		const playerName = getPlayerNameFromAllCards();
		const newCard = {
			title: `${playerName}'s Servants 1`,
			type: 'Lists',
			keys: `${playerName}'s Servants, Servants`,
			value: `This is a list of the Names of ${playerName}'s Servants.\n- {Servant 1:}\n- {Servant 2:}\n- {Servant 3:}\n- {Servant 4:}\n- {Servant 5:}\n- {Servant 6:}\n- {Servant 7:}\n- {Servant 8:}\n- {Servant 9:}\n- {Servant 10:}\n`,
			description: 'Automatically managed by the Testing script.',
			isVisible: true,
			useForCharacterCreation: false
		};

		state.storyCards = state.storyCards || [];
		state.storyCards.push(newCard);

		logDebug(`Created new servants list card: ${newCard.title}`);
		return newCard;
	}

	function getPlayerNameFromAllCards() {
		console.log('[Testing] getPlayerNameFromAllCards() called');

		// Look for character sheet without calling getCharacterSheetCard to avoid circular dependency
		if (!state.storyCards) {
			console.log('[Testing] No storyCards found');
			return '${Your ${ First Name } And ${Last Name} is}';
		}

		// Find character sheet card directly
		const characterSheet = state.storyCards.find((card) => {
			const content = card.value || card.entry || '';
			return (
				card.type === 'Character Sheet' ||
				content.includes('Subordinate(s):') ||
				(content.includes('Name:') && content.includes('Gender:'))
			);
		});

		if (characterSheet) {
			console.log(
				'[Testing] Found character sheet for player name extraction'
			);
			const playerName = getPlayerName(characterSheet);
			console.log('[Testing] Extracted player name:', playerName);
			if (!playerName.includes('${') && playerName !== 'the Master') {
				return playerName;
			}
		}

		console.log(
			'[Testing] Could not find valid player name, returning placeholder'
		);
		return '${Your ${ First Name } And ${Last Name} is}';
	}

	function initializeServantsInList(card, servants) {
		let cardText = card.value || card.entry || '';

		// Fill in the servant slots
		servants.forEach((servant, index) => {
			if (index < 10) {
				// Only fill up to 10 slots
				const slotNumber = index + 1;
				const emptySlot = `{Servant ${slotNumber}:}`;
				const filledSlot = `{Servant ${slotNumber}: ${servant}}`;
				cardText = cardText.replace(emptySlot, filledSlot);
			}
		});

		// Update the card
		if (card.value !== undefined) {
			card.value = cardText;
		} else {
			card.entry = cardText;
		}

		logDebug(`Initialized ${servants.length} servants in list card`);
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Story Card Utility Functions

	function getListsStoryCards() {
		if (!state.storyCards) return [];

		return state.storyCards.filter(
			(card) =>
				card.type === TS.config.listCardType ||
				card.type === 'Lists' ||
				(card.title &&
					(card.title.toLowerCase().includes('list') ||
						card.title.toLowerCase().includes('inventory') ||
						card.title.toLowerCase().includes('characters') ||
						card.title.toLowerCase().includes('locations') ||
						card.title.toLowerCase().includes('items') ||
						card.title.toLowerCase().includes('servant')))
		);
	}

	function getCardText(card) {
		return (
			(card.value || '') + (card.entry || '') + (card.description || '')
		);
	}

	function isCardFull(card) {
		const text = getCardText(card);
		return text.length >= TS.config.cardLimit;
	}

	function createNewListCard(baseName, number) {
		// Determine if this should be a structured list format or bullet format
		const isStructuredList =
			baseName.toLowerCase().includes('servant') ||
			baseName.toLowerCase().includes('list');

		const newCard = {
			title: `${baseName} ${number}`,
			type: TS.config.listCardType,
			keys: baseName.toLowerCase().replace(/\s+/g, ','),
			entry: '',
			description: '',
			isVisible: true
		};

		if (isStructuredList) {
			// Create structured list format like the Servants example
			const itemName = extractItemNameFromBaseName(baseName); // e.g., "Servant" from "Servants List"
			newCard.entry = createStructuredListEntry(itemName, baseName);
		} else {
			// Create simple continuation format
			newCard.entry = `${baseName} (continued)\n\n`;
		}

		state.storyCards = state.storyCards || [];
		state.storyCards.push(newCard);

		logDebug(`Created new list card: ${newCard.title}`);
		return newCard;
	}

	function extractItemNameFromBaseName(baseName) {
		// Extract "Servant" from "Servants List" or "Character" from "Characters List"
		const words = baseName.split(/\s+/);
		if (words.length > 0) {
			const firstWord = words[0];
			// Convert plural to singular if needed
			if (firstWord.endsWith('s')) {
				return firstWord.slice(0, -1);
			}
			return firstWord;
		}
		return 'Item';
	}

	function createStructuredListEntry(itemName, baseName) {
		// Create the structured format like the Servants example
		const playerNamePlaceholder =
			'${Your ${ First Name } And ${Last Name} is}';
		let entry = `This is a list of the Names of ${playerNamePlaceholder}'s ${baseName}.\n`;

		// Create 10 empty slots
		for (let i = 1; i <= 10; i++) {
			entry += `- {${itemName} ${i}: }\n`;
		}

		return entry;
	}

	function findOrCreateListCard(category) {
		const listCards = getListsStoryCards();
		let targetCard = null;

		// Try to find existing card for this category that has empty slots
		for (const card of listCards) {
			if (cardMatchesCategory(card, category)) {
				if (hasEmptySlots(card) && !isCardFull(card)) {
					targetCard = card;
					break;
				}
			}
		}

		// If no suitable card found, create new one
		if (!targetCard) {
			const baseName = generateBaseNameForCategory(category);
			const existingNumbers = listCards
				.filter((card) => card.title.startsWith(baseName))
				.map((card) => {
					const match = card.title.match(/(\d+)$/);
					return match ? parseInt(match[1]) : 1;
				});

			const nextNumber =
				existingNumbers.length > 0
					? Math.max(...existingNumbers) + 1
					: 1;
			targetCard = createNewListCard(baseName, nextNumber);
		}

		return targetCard;
	}

	function cardMatchesCategory(card, category) {
		const title = card.title.toLowerCase();
		const cardText = getCardText(card).toLowerCase();
		const cat = category.toLowerCase();

		return (
			title.includes(cat) ||
			cardText.includes(cat) ||
			(cat === 'characters' &&
				(title.includes('servant') || cardText.includes('servant'))) ||
			(cat === 'servants' &&
				(title.includes('character') || cardText.includes('character')))
		);
	}

	function hasEmptySlots(card) {
		const text = getCardText(card);
		// Check for empty slots like {Servant X: }
		return /\{\s*\w+\s+\d+:\s*\}/.test(text);
	}

	function generateBaseNameForCategory(category) {
		switch (category.toLowerCase()) {
			case 'servants':
			case 'servant':
				return 'Servants List';
			case 'characters':
			case 'character':
				return 'Characters List';
			case 'locations':
			case 'location':
				return 'Locations List';
			case 'items':
			case 'item':
				return 'Items List';
			case 'events':
			case 'event':
				return 'Events List';
			default:
				return (
					category.charAt(0).toUpperCase() +
					category.slice(1) +
					' List'
				);
		}
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Text Extraction Functions

	function extractMarkedText(text) {
		console.log(
			'[Testing] extractMarkedText() called with text length:',
			text.length
		);
		const markerRegex = /#--\s*(.*?)\s*--#/gs;
		const extracted = [];
		let match;
		let matchCount = 0;

		while ((match = markerRegex.exec(text)) !== null) {
			matchCount++;
			const content = match[1].trim();
			console.log(
				`[Testing] Found marker ${matchCount}: "${content.substring(
					0,
					50
				)}..."`
			);

			if (content && !TS.processedMarkers.has(content)) {
				console.log(
					`[Testing] Content is new, adding to extracted array`
				);
				extracted.push(content);
				TS.processedMarkers.add(content);
			} else {
				console.log(
					`[Testing] Content is empty or already processed, skipping`
				);
			}
		}

		console.log(
			`[Testing] extractMarkedText() found ${matchCount} total markers, ${extracted.length} new ones`
		);
		console.log(
			`[Testing] Processed markers count: ${TS.processedMarkers.size}`
		);
		return extracted;
	}

	function removeMarkers(text) {
		console.log(
			'[Testing] removeMarkers() called with text length:',
			text.length
		);
		const result = text.replace(/#--\s*.*?\s*--#/gs, '');
		console.log('[Testing] removeMarkers() result length:', result.length);
		return result;
	}

	function processExtractedInfo(infoArray) {
		console.log(
			'[Testing] processExtractedInfo() called with',
			infoArray.length,
			'items'
		);

		for (let i = 0; i < infoArray.length; i++) {
			const info = infoArray[i];
			console.log(
				`[Testing] Processing item ${i + 1}/${
					infoArray.length
				}: "${info.substring(0, 50)}..."`
			);

			const category = detectCategory(info);
			console.log(`[Testing] Detected category: "${category}"`);

			const relevantCard = findOrCreateListCard(category);
			console.log(
				`[Testing] Found/created card for category: "${category}"`
			);

			console.log(`[Testing] Adding info to card...`);
			addInfoToCard(relevantCard, info);

			if (
				TS.config.autoCharacters &&
				(category.toLowerCase().includes('character') ||
					category.toLowerCase().includes('servant'))
			) {
				console.log(
					`[Testing] Auto-characters enabled and category contains character/servant, processing character info...`
				);
				processCharacterInfo(info);
			} else {
				console.log(
					`[Testing] Skipping character processing - autoCharacters: ${TS.config.autoCharacters}, category: "${category}"`
				);
			}
		}

		if (TS.config.removeDuplicates) {
			removeDuplicatesFromListCards();
		}

		console.log('[Testing] processExtractedInfo() completed');
	}

	function detectCategory(info) {
		const lower = info.toLowerCase();

		if (
			lower.includes('servant') ||
			lower.includes('butler') ||
			lower.includes('maid')
		) {
			return 'servants';
		} else if (
			lower.includes('character') ||
			lower.includes('person') ||
			lower.includes('npc')
		) {
			return 'characters';
		} else if (
			lower.includes('location') ||
			lower.includes('place') ||
			lower.includes('room')
		) {
			return 'locations';
		} else if (
			lower.includes('item') ||
			lower.includes('object') ||
			lower.includes('weapon')
		) {
			return 'items';
		} else if (
			lower.includes('event') ||
			lower.includes('quest') ||
			lower.includes('mission')
		) {
			return 'events';
		} else {
			return 'general';
		}
	}

	function addInfoToCard(card, info) {
		if (!card || !info) return;

		// Check if info already exists to avoid duplicates
		const existingText = getCardText(card);
		if (existingText.includes(info)) {
			logDebug('Info already exists in card, skipping');
			return;
		}

		// Check if this is a List card with the {Name X: } format
		if (isListFormatCard(card)) {
			addInfoToListFormatCard(card, info);
		} else {
			// Use the original bullet point format for other cards
			addInfoToBulletCard(card, info);
		}

		logDebug(`Added info to card "${card.title}": ${info}`);
	}

	function isListFormatCard(card) {
		const text = getCardText(card);
		// Check if the card has the {Name X: } format
		return /\{\s*\w+\s+\d+:\s*\}/.test(text);
	}

	function addInfoToListFormatCard(card, info) {
		// Find the pattern for empty slots like {Servant X: }
		// Check both value and entry fields
		let cardText = card.value || card.entry || '';
		const useValueField = card.value !== undefined;

		const emptySlotRegex = /\{\s*(\w+)\s+(\d+):\s*\}/;
		const match = cardText.match(emptySlotRegex);

		if (match) {
			// Fill the first empty slot
			const fullPattern = match[0]; // e.g., "{Servant 1:}"
			const replacement = fullPattern.replace('}', ` ${info}}`); // e.g., "{Servant 1: John}"

			const newText = cardText.replace(fullPattern, replacement);

			// Update the appropriate field
			if (useValueField) {
				card.value = newText;
			} else {
				card.entry = newText;
			}

			logDebug(`Filled slot ${fullPattern} with "${info}"`);
		} else {
			// No empty slots found, need to create a new numbered list card
			const baseName = extractBaseNameFromListCard(card);
			const newCard = createNewListCard(
				baseName,
				getNextCardNumber(card.title)
			);
			addInfoToListFormatCard(newCard, info);
		}
	}

	function addInfoToBulletCard(card, info) {
		// Original bullet point format
		const entryLength = (card.entry || '').length;
		const descLength = (card.description || '').length;

		if (entryLength + info.length + 10 < TS.config.cardLimit) {
			card.entry = (card.entry || '') + '• ' + info + '\n';
		} else if (descLength + info.length + 10 < TS.config.cardLimit) {
			card.description = (card.description || '') + '• ' + info + '\n';
		} else {
			// Card is full, create new card
			const newCard = createNewListCard(
				card.title.replace(/\s+\d+$/, ''),
				getNextCardNumber(card.title)
			);
			newCard.entry += '• ' + info + '\n';
		}
	}

	function extractBaseNameFromListCard(card) {
		// Extract base name from cards like "Servants List 1" -> "Servants List"
		return card.title.replace(/\s+\d+$/, '');
	}

	function getNextCardNumber(cardTitle) {
		const match = cardTitle.match(/(\d+)$/);
		return match ? parseInt(match[1]) + 1 : 2;
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Character Management Functions

	function processCharacterInfo(info) {
		const characterName = extractCharacterName(info);
		if (!characterName || TS.createdCharacters.has(characterName)) {
			return;
		}

		const existingCharacter = getCharacterCard(characterName);
		if (existingCharacter) {
			updateCharacterDescription(existingCharacter, info);
		} else {
			createCharacterCard(characterName, info);
		}

		TS.createdCharacters.add(characterName);
	}

	function extractCharacterName(info) {
		// Simple name extraction - look for capitalized words that might be names
		const words = info.split(/\s+/);
		const capitalizedWords = words.filter(
			(word) =>
				word.length > 1 &&
				word[0] === word[0].toUpperCase() &&
				!/^(The|A|An|In|On|At|To|For|With|By)$/i.test(word)
		);

		// Return first likely name or combination
		if (capitalizedWords.length > 0) {
			return capitalizedWords[0];
		}

		return null;
	}

	function getCharacterCard(name) {
		if (!state.storyCards) return null;

		return state.storyCards.find(
			(card) =>
				card.type === TS.config.characterCardType && card.title === name
		);
	}

	function createCharacterCard(name, info) {
		const characterCard = {
			title: name,
			type: TS.config.characterCardType,
			keys: name.toLowerCase(),
			entry: `Character: ${name}\n\n${info}`,
			description: '',
			isVisible: true
		};

		state.storyCards = state.storyCards || [];
		state.storyCards.push(characterCard);

		logDebug(`Created character card for: ${name}`);
		return characterCard;
	}

	function updateCharacterDescription(card, newInfo) {
		if (!card || !newInfo) return;

		const existingText = getCardText(card);
		if (existingText.includes(newInfo)) {
			return; // Info already present
		}

		card.entry += '\n' + newInfo;
		logDebug(`Updated character card: ${card.title}`);
	}

	function getAllCharacterNames() {
		if (!state.storyCards) return [];

		return state.storyCards
			.filter((card) => card.type === TS.config.characterCardType)
			.map((card) => card.title);
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Utility Functions

	function removeDuplicatesFromListCards() {
		const listCards = getListsStoryCards();

		for (const card of listCards) {
			card.entry = removeDuplicateLines(card.entry || '');
			card.description = removeDuplicateLines(card.description || '');
		}
	}

	function removeDuplicateLines(text) {
		const lines = text.split('\n');
		const seen = new Set();
		const unique = [];

		for (const line of lines) {
			const trimmed = line.trim();
			if (trimmed && !seen.has(trimmed)) {
				seen.add(trimmed);
				unique.push(line);
			} else if (!trimmed) {
				unique.push(line); // Keep empty lines for formatting
			}
		}

		return unique.join('\n');
	}

	function pinCardToTop(card) {
		if (!card || !state.storyCards) return;

		const index = state.storyCards.indexOf(card);
		if (index > 0) {
			state.storyCards.splice(index, 1);
			state.storyCards.unshift(card);
		}
	}

	function cleanContextText(text) {
		// Clean up context similar to AC Library
		return text
			.replace(/\s*#--\s*.*?\s*--#\s*/gs, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Command Processing

	function processCommands(text) {
		console.log(
			'[Testing] processCommands() called with text:',
			text.substring(0, 100) + '...'
		);
		const commandRegex =
			/\/testing\s+(enable|disable|reset|help|debug|status)/gi;
		let match;
		let commandCount = 0;

		while ((match = commandRegex.exec(text)) !== null) {
			commandCount++;
			const command = match[1].toLowerCase();
			console.log(
				`[Testing] Found command ${commandCount}: "${command}"`
			);
			executeCommand(command);

			// Remove command from text
			console.log(`[Testing] Removing command "${match[0]}" from text`);
			text = text.replace(match[0], '');
		}

		console.log(
			`[Testing] processCommands() processed ${commandCount} commands`
		);
		console.log(`[Testing] Final text length: ${text.length}`);
		return text;
	}

	function executeCommand(command) {
		switch (command) {
			case 'enable':
				TS.config.enabled = true;
				setMessage('Testing script enabled!');
				break;
			case 'disable':
				TS.config.enabled = false;
				setMessage('Testing script disabled!');
				break;
			case 'reset':
				resetScript();
				setMessage('Testing script reset to defaults!');
				break;
			case 'debug':
				TS.config.debugMode = !TS.config.debugMode;
				setMessage(
					`Debug mode ${
						TS.config.debugMode ? 'enabled' : 'disabled'
					}!`
				);
				break;
			case 'status':
				showStatus();
				break;
			case 'help':
				showHelp();
				break;
		}
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Management Functions

	function resetScript() {
		// Reset to default configuration
		TS.config = {
			enabled: DEFAULT_ENABLED,
			pinSettingsCard: DEFAULT_PIN_SETTINGS_CARD,
			autoDetect: DEFAULT_AUTO_DETECT,
			cardLimit: DEFAULT_CARD_LIMIT,
			autoCharacters: DEFAULT_AUTO_CHARACTERS,
			removeDuplicates: DEFAULT_REMOVE_DUPLICATES,
			debugMode: DEFAULT_DEBUG_MODE,
			listCardType: DEFAULT_LIST_CARD_TYPE,
			characterCardType: DEFAULT_CHARACTER_CARD_TYPE
		};

		TS.lastProcessedAction = -1;
		TS.processedMarkers.clear();
		TS.createdCharacters.clear();
		TS.initializedFromCharacterSheet = false;
		TS.logs = [];

		logDebug('Script reset to defaults');
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// Logging and Error Handling

	function logDebug(message) {
		if (!TS.config.debugMode) return;

		const timestamp = new Date().toISOString();
		const logEntry = `[${timestamp}] ${message}`;

		TS.logs.push(logEntry);

		// Keep only last 100 log entries
		if (TS.logs.length > 100) {
			TS.logs = TS.logs.slice(-100);
		}

		// Console not available in AI Dungeon, just store in logs
	}

	function logError(message, error) {
		const errorMsg = `ERROR: ${message} - ${
			error?.toString() || 'Unknown error'
		}`;
		TS.logs.push(errorMsg);
		// Console not available in AI Dungeon, just store in logs
	}

	function setMessage(msg) {
		if (state.message !== undefined) {
			state.message = msg;
		}
	}

	function showStatus() {
		const status = `Testing Script Status: Enabled: ${TS.config.enabled} Processed Markers: ${TS.processedMarkers.size} Created Characters: ${TS.createdCharacters.size} Debug Mode: ${TS.config.debugMode}`;

		setMessage(status);
	}

	function showHelp() {
		const help = `Testing Script Help:

		Commands:
		• /testing enable - Enable the script
		• /testing disable - Disable the script  
		• /testing reset - Reset to default settings
		• /testing debug - Toggle debug mode
		• /testing status - Show current status
		• /testing help - Show this help

		Usage:
		Place information between #-- text --# markers in your story to automatically add it to relevant Lists Story Cards.

		The script will automatically:
		• Create Lists Story Cards for different categories
		• Add information from markers to appropriate cards
		• Create character profiles when characters are mentioned
		• Remove duplicate entries
		• Manage card capacity (max ${TS.config.cardLimit} characters per card)`;

		setMessage(help);
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// State Management

	function saveState() {
		console.log('[Testing] saveState() called');
		console.log('[Testing] Current TS state preview:', {
			enabled: TS.config.enabled,
			autoCharacters: TS.config.autoCharacters,
			createdCharactersCount: TS.createdCharacters.size,
			processedMarkersCount: TS.processedMarkers.size,
			initializedFromCharacterSheet: TS.initializedFromCharacterSheet
		});

		state.Testing = TS;
		console.log('[Testing] Saved TS to state.Testing');

		// Also save to settings card if it exists
		const settingsCard = getSettingsCard();
		if (settingsCard) {
			console.log(
				'[Testing] Updating settings card description with current state'
			);
			settingsCard.description = JSON.stringify(TS);
		} else {
			console.log('[Testing] No settings card found to update');
		}
		console.log('[Testing] saveState() completed');
	}

	//—————————————————————————————————————————————————————————————————————————————————

	// API Functions

	function getAPI() {
		console.log('[Testing] getAPI() called - creating API object');
		return {
			// Core functionality
			enable: () => {
				console.log('[Testing] API enable() called');
				TS.config.enabled = true;
			},
			disable: () => {
				console.log('[Testing] API disable() called');
				TS.config.enabled = false;
			},
			isEnabled: () => {
				console.log(
					'[Testing] API isEnabled() called, returning:',
					TS.config.enabled
				);
				return TS.config.enabled;
			},

			// Configuration
			getConfig: () => {
				console.log('[Testing] API getConfig() called');
				return { ...TS.config };
			},
			setConfig: (newConfig) => {
				console.log(
					'[Testing] API setConfig() called with:',
					newConfig
				);
				TS.config = { ...TS.config, ...newConfig };
			},

			// Card management
			getListsCards: () => {
				console.log('[Testing] API getListsCards() called');
				return getListsStoryCards();
			},
			getCharacterCards: () => {
				console.log('[Testing] API getCharacterCards() called');
				return (
					state.storyCards?.filter(
						(card) => card.type === TS.config.characterCardType
					) || []
				);
			},
			createListCard: (category) => {
				console.log(
					'[Testing] API createListCard() called with category:',
					category
				);
				return findOrCreateListCard(category);
			},

			// Information processing
			addInfo: (category, info) => {
				console.log(
					'[Testing] API addInfo() called with category:',
					category,
					'info:',
					info.substring(0, 50) + '...'
				);
				const card = findOrCreateListCard(category);
				addInfoToCard(card, info);
			},

			// Character management
			createCharacter: createCharacterCard,
			getCharacter: getCharacterCard,
			getAllCharacters: getAllCharacterNames,

			// Utility
			removeDuplicates: removeDuplicatesFromListCards,
			reset: resetScript,

			// Debugging
			getLogs: () => [...TS.logs],
			debug: (enabled) => {
				TS.config.debugMode = enabled;
			}
		};
	}
	return getAPI();
}

// Initialize the Testing script
function init() {
	console.log(
		'[Testing] init() called - Testing Library initialization starting'
	);
	// This function is called when the library is first loaded
	// It sets up the basic hooks and default state

	// Validate globalThis.text exists
	console.log('[Testing] Checking if text variable exists...');
	if (typeof text === 'undefined') {
		console.log(
			'[Testing] text is undefined, setting globalThis.text to newline'
		);
		globalThis.text = '\n';
	} else if (text === null) {
		console.log(
			'[Testing] text is null, setting globalThis.text to newline'
		);
		globalThis.text = '\n';
	} else {
		console.log('[Testing] text variable exists');
	}

	// Make Testing function globally available
	console.log('[Testing] Making Testing function globally available...');
	if (typeof globalThis !== 'undefined') {
		globalThis.Testing = Testing;
		console.log('[Testing] Testing function assigned to globalThis');
	} else {
		console.log(
			'[Testing] globalThis is undefined, cannot assign Testing function'
		);
	}

	// Initialize with null hook to perform any setup
	console.log('[Testing] Calling Testing(null, text) for initial setup...');
	Testing(null, text);
	console.log('[Testing] init() completed successfully');
}

// Ensure the Testing function is available globally
if (typeof globalThis !== 'undefined') {
	globalThis.Testing = Testing;
}

// Auto-initialize if not already done
if (typeof state !== 'undefined' && !state.TestingInitialized) {
	init();
	if (typeof state !== 'undefined') {
		state.TestingInitialized = true;
	}
}
