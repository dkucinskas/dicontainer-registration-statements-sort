var vscode = require('vscode');

const PRIORITIES = {
    'router': 1,
    'middleware': 2,
    'helper': 3,
    'helpers': 3,
    'mapper': 4,
    'utils': 5,
    'api': 6,
    'repository': 7,
    'service': 8,
    'services': 8,
    'controller': 9,
};

function getPriority(name) {
    const words = name.split(/(?=[A-Z])/);
    const lastWord = words[words.length - 1].toLowerCase();
    return PRIORITIES[lastWord] || 0;
}

function sortAlgorithm(a, b) {
    // Skip empty lines
    if (!a || !b) return 0;

    // Skip commented lines
    if (a.startsWith('/*') || a.startsWith('//')) {
        return 0;
    }
    if (b.startsWith('/*') || b.startsWith('//')) {
        return 0;
    }

    const aParts = a.split('\'');
    const bParts = b.split('\'');
    
    const aPriority = getPriority(aParts[1]);
    const bPriority = getPriority(bParts[1]);
    if (aPriority !== bPriority) {
        return aPriority > bPriority ? 1 : -1;
    }

    if (aParts[0].indexOf('container.register') >= 0 && bParts[0].indexOf('container.register') >= 0) {
        if (aParts[1] === bParts[1]) {
            return 0;
        }
        return aParts[1] > bParts[1] ? 1 : -1;
    }

    return 0;
}

function activate(context) {
    const disposable = vscode.commands.registerCommand('dicontainer-registration-statements-sort.sort', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        if (!document) {
            return;
        }

        const selectedLines = document.getText(editor.selection);
        if (!selectedLines) {
            return;
        }
        
        const requireLines = selectedLines.split('\n');
        if (!requireLines || requireLines.length < 1) {
            return;
        }
        
        requireLines.sort(function(a, b) {
            let order;
            try {
                order = sortAlgorithm(a, b);
                // console.log(`a: ${a}, b: ${b} = ${order}`);
            } catch (e) {
                console.log(`a: ${a}, b: ${b} = ${order} / Error: ${e}`);
                return 0;
            }

            return order;
        });

        editor.edit(function (editBuilder) {
            editBuilder.replace(editor.selection, requireLines.join('\n'));
        });
    
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;