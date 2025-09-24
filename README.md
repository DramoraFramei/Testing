# AI Dungeon Testing Script

A comprehensive AI Dungeon script library for automated story card management, character initialization, and information extraction from marked text.

## Features

- **Automated Story Card Management**: Creates and manages Lists Story Cards for organizing story information
- **Character Sheet Integration**: Automatically initializes servants from Character Sheet "Subordinate(s)" field
- **Marker-Based Information Extraction**: Extracts information from `#-- --#` markers in AI output
- **Character Profile Creation**: Auto-creates character cards for detected characters
- **Command System**: In-game commands for script control (`/testing enable`, `/testing disable`, etc.)
- **Settings Persistence**: Maintains configuration across game sessions
- **Comprehensive Logging**: Detailed console logging for debugging

## Installation

1. Copy the scripts from the `Testing Script` folder to your AI Dungeon scenario
2. Add the following scripts to your scenario:
   - `Testing Library.js` - Main library (add to Shared Library)
   - `Testing Input.js` - Input modifier
   - `Testing Context.js` - Context modifier  
   - `Testing Output.js` - Output modifier

## Usage

### Basic Setup

The script automatically initializes when your scenario runs. It will:
1. Create a Settings Story Card for configuration
2. Initialize servants from your Character Sheet if available
3. Begin processing marked text for information extraction

### Marking Information for Extraction

Use `#-- --#` markers around information you want to automatically add to story cards:

```
#-- Aria learned a new fire spell that can burn through steel --#
#-- The village of Thornwick has a population of 500 people --#
#-- Servant Marcus: Loyal bodyguard with expertise in swordplay --#
```

### Commands

Available in-game commands:
- `/testing enable` - Enable the script
- `/testing disable` - Disable the script
- `/testing reset` - Reset to default settings
- `/testing help` - Show help information
- `/testing debug` - Toggle debug mode
- `/testing status` - Show current status

### Configuration

The script creates a Settings Story Card that shows:
- Current configuration status
- Usage instructions
- Available commands
- Script statistics

## Story Card Format

The script creates Lists Story Cards with the following format:
```
List: [Category Name]

{Servant 1: [Name and details]}
{Servant 2: [Name and details]}
...
{Servant 10: }

Additional Information:
- [Extracted information items]
```

## Character Sheet Integration

If your scenario has a Character Sheet with a "Subordinate(s):" field, the script will:
1. Parse the subordinate names
2. Initialize them in the Lists Story Card
3. Optionally create character profile cards for each

Example Character Sheet format:
```
Name: Your Character Name
Gender: Your Gender
Subordinate(s): Alice, Bob, Charlie
```

## Technical Details

### Architecture
- **Main Library**: Core functionality and API
- **Hook Scripts**: Input, Context, and Output processors
- **State Management**: Persistent configuration and data storage
- **Error Handling**: Comprehensive error catching and fallback mechanisms

### Configuration Options
- `enabled`: Enable/disable script functionality
- `autoDetect`: Automatic information detection
- `autoCharacters`: Auto-create character cards
- `removeDuplicates`: Remove duplicate information
- `debugMode`: Enable debug logging
- `cardLimit`: Character limit for story cards

## Debugging

The script includes extensive console logging. To view debug information:
1. Enable debug mode with `/testing debug`
2. Check the browser console for detailed logs
3. All logs are prefixed with `[Testing]` for easy filtering

## Version History

- **v1.0**: Initial release with basic functionality
- **v1.1**: Added Character Sheet integration
- **v1.2**: Enhanced error handling and logging
- **v1.3**: Improved story card visibility and persistence

## Contributing

This script is actively maintained. When reporting issues, please include:
- AI Dungeon scenario type
- Console logs (with sensitive information removed)
- Steps to reproduce the issue
- Expected vs actual behavior

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the AI Dungeon community
- Inspired by the need for better story organization tools
- Uses AI Dungeon's scripting API for seamless integration