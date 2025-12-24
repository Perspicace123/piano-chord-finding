// 和弦到音符的映射（半音偏移）
const CHORD_NOTES = {
    // 三和弦
    "major": [0, 4, 7],
    "minor": [0, 3, 7],
    "dim": [0, 3, 6],
    "aug": [0, 4, 8],

    // 七和弦
    "maj7": [0, 4, 7, 11],
    "min7": [0, 3, 7, 10],
    "7": [0, 4, 7, 10],
    "min7b5": [0, 3, 6, 10],
    "dim7": [0, 3, 6, 9],

    // 九和弦
    "maj9": [0, 4, 7, 11, 14],
    "min9": [0, 3, 7, 10, 14],
    "9": [0, 4, 7, 10, 14],

    // 其他和弦
    "sus2": [0, 2, 7],
    "sus4": [0, 5, 7],
    "add9": [0, 4, 7, 14],
    "6": [0, 4, 7, 9],
    "min6": [0, 3, 7, 9],
};

// 音符名称
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// 钢琴键盘布局 (从C3到C5)
const KEYBOARD_NOTES = [
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
    "C5"
];

// 音符到八度和索引的映射
const NOTE_TO_OCTAVE_AND_INDEX = {};
KEYBOARD_NOTES.forEach((note, index) => {
    NOTE_TO_OCTAVE_AND_INDEX[note] = {
        octave: parseInt(note.slice(-1)),
        name: note.slice(0, -1),
        index: index
    };
});

// 获取根音对应的基准音符（从C3开始）
function getBaseNote(rootNote) {
    // 默认从C3开始，但可以根据需要调整
    return rootNote + "3";
}

// 计算音符在键盘上的实际位置
function getNoteOnKeyboard(baseNote, interval) {
    const baseInfo = NOTE_TO_OCTAVE_AND_INDEX[baseNote];
    if (!baseInfo) {
        throw new Error('无效的基准音符');
    }

    // 从基准音符开始计算
    const totalSemitones = baseInfo.index + interval;
    const octaveShift = Math.floor(totalSemitones / 12);
    const noteIndex = totalSemitones % 12;

    // 获取音符名称（不带八度）
    const noteName = getNoteNameByIndex(noteIndex);

    // 计算八度
    const octave = 3 + octaveShift; // 从C3开始

    return noteName + octave;
}

// 根据索引获取音符名称
function getNoteNameByIndex(index) {
    return NOTE_NAMES[index];
}

// 获取和弦音符（从C3开始）
function getChordNotes(rootNote, chordType) {
    // 获取根音的音符索引（不带八度）
    const rootIndex = NOTE_NAMES.indexOf(rootNote);
    if (rootIndex === -1) {
        throw new Error('无效的根音');
    }

    // 获取和弦的音程
    const intervals = CHORD_NOTES[chordType];
    if (!intervals) {
        throw new Error('不支持的和弦类型');
    }

    // 创建基准音符（从C3开始）
    const baseNote = rootNote + "3";

    // 计算和弦包含的音符
    const chordNotes = [];
    for (let interval of intervals) {
        const note = getNoteOnKeyboard(baseNote, interval);
        // 确保音符在键盘范围内
        if (KEYBOARD_NOTES.includes(note)) {
            chordNotes.push(note);
        } else {
            console.warn(`音符 ${note} 不在键盘范围内`);
        }
    }

    return chordNotes;
}

// 生成钢琴键盘
function createPianoKeyboard() {
    const piano = document.getElementById('piano');
    piano.innerHTML = '';

    // 黑键位置映射
    const blackKeyPositions = {
        "C#3": 1, "D#3": 2, "F#3": 4, "G#3": 5, "A#3": 6,
        "C#4": 8, "D#4": 9, "F#4": 11, "G#4": 12, "A#4": 13
    };

    // 创建白键
    let whiteKeyIndex = 0;
    for (let note of KEYBOARD_NOTES) {
        if (!note.includes('#')) {
            const whiteKey = document.createElement('div');
            whiteKey.className = 'white-key';
            whiteKey.id = `key-${note}`;
            whiteKey.dataset.note = note;
            whiteKey.style.left = `${whiteKeyIndex * 30}px`;
            whiteKey.style.position = 'absolute';

            const label = document.createElement('div');
            label.className = 'note-label';
            label.textContent = note;
            whiteKey.appendChild(label);

            piano.appendChild(whiteKey);
            whiteKeyIndex++;
        }
    }

    // 创建黑键
    for (let note of KEYBOARD_NOTES) {
        if (note.includes('#')) {
            const blackKey = document.createElement('div');
            blackKey.className = 'black-key';
            blackKey.id = `key-${note}`;
            blackKey.dataset.note = note;

            const position = blackKeyPositions[note];
            if (position !== undefined) {
                blackKey.style.left = `${position * 30 - 10}px`;
                blackKey.style.position = 'absolute';

                const label = document.createElement('div');
                label.className = 'note-label';
                label.textContent = note;
                blackKey.appendChild(label);

                piano.appendChild(blackKey);
            }
        }
    }
}

// 更新和弦显示
function updateChord() {
    try {
        const rootNote = document.getElementById('root-note').value;
        const chordType = document.getElementById('chord-type').value;

        // 获取和弦音符（从C3开始）
        const chordNotes = getChordNotes(rootNote, chordType);

        // 更新显示
        document.getElementById('chord-name').textContent = `${rootNote}${chordType}`;
        document.getElementById('chord-notes').textContent = chordNotes.join(', ');

        // 重置所有键
        KEYBOARD_NOTES.forEach(note => {
            const key = document.getElementById(`key-${note}`);
            if (key) {
                key.classList.remove('active');
            }
        });

        // 高亮和弦中的音符
        chordNotes.forEach(note => {
            const key = document.getElementById(`key-${note}`);
            if (key) {
                key.classList.add('active');
            } else {
                console.warn(`找不到键: ${note}`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    createPianoKeyboard();
    updateChord();

    // 添加事件监听器
    document.getElementById('root-note').addEventListener('change', updateChord);
    document.getElementById('chord-type').addEventListener('change', updateChord);
});