export default async function ({ addon, msg }) {
  const ScratchBlocks = await addon.tab.traps.getBlockly();

  let defaultKeys = null;
  function appendKeys(keys, enableShiftKeys) {
    if (!defaultKeys) {
      defaultKeys = [...keys];
    }
    if (!addon.self.disabled) {
      keys.push(
        ...[
          ["-", "-"],
          [",", ","],
          [".", "."],
        ]
      );
      keys.splice(5, 0, [msg("enter-key"), "enter"]);
      if (addon.settings.get("experimentalKeys")) {
        keys.push(
          ...[
            ["`", "`"],
            ["=", "="],
            ["[", "["],
            ["]", "]"],
            ["\\", "\\"],
            [";", ";"],
            ["'", "'"],
            ["/", "/"],
          ]
        );
      }
      if (enableShiftKeys && addon.settings.get("shiftKeys")) {
        keys.push(
          ...[
            ["!", "!"],
            ["@", "@"],
            ["#", "#"],
            ["$", "$"],
            ["%", "%"],
            ["^", "^"],
            ["&", "&"],
            ["*", "*"],
            ["(", "("],
            [")", ")"],
            ["_", "_"],
            ["+", "+"],
            ["{", "{"],
            ["}", "}"],
            ["|", "|"],
            [":", ":"],
            ['"', '"'],
            ["?", "?"],
            ["<", "<"],
            [">", ">"],
            ["~", "~"],
          ]
        );
      }
      if (addon.settings.get("twKeys")) {
        keys.push(
          ...[
            ["backspace", "backspace"],
            ["delete", "delete"],
            ["shift", "shift"],
            ["caps lock", "caps lock"],
            ["scroll lock", "scroll lock"],
            ["control", "control"],
            ["escape", "escape"],
            ["insert", "insert"],
            ["home", "home"],
            ["end", "end"],
            ["page up", "page up"],
            ["page down", "page down"],
          ]
        );
      }
      if (addon.settings.get("jokeKeys")) {
        keys.push(
          ...[
            ["windows", "windows"],
            ["ä", "ä"],
            ["ö", "ö"],
            ["ü", "ü"],
            ["bombastic side eye", "bombastic side eye"],
            ["trolololo", "trolololo"],
            ["intact", "intact"],
            ["ip", "ip"],
            ["spell icup", "spell icup"],
            ["hmmm", "hmmm"],
            ["joke", "joke"],
            ["backyardigans", "backyardigans"],
          ]
        );
      }
    }
    return keys;
  }

  for (const opcode of ["sensing_keyoptions", "event_whenkeypressed", "event_whenkeyhit"]) {
    const block = ScratchBlocks.Blocks[opcode];
    const originalInit = block.init;
    block.init = function (...args) {
      const originalJsonInit = this.jsonInit;
      this.jsonInit = function (obj) {
        appendKeys(obj.args0[0].options, opcode === "event_whenkeypressed", "event_whenkeyhit");
        return originalJsonInit.call(this, obj);
      };
      return originalInit.call(this, ...args);
    };
  }

  const updateExistingBlocks = () => {
    const workspace = Blockly.getMainWorkspace();
    const flyout = workspace && workspace.getFlyout();
    if (workspace && flyout) {
      const allBlocks = [...workspace.getAllBlocks(), ...flyout.getWorkspace().getAllBlocks()];
      for (const block of allBlocks) {
        if (block.type !== "event_whenkeypressed" && block.type !== "sensing_keyoptions" && block.type !== "event_whenkeyhit") {
          continue;
        }
        const input = block.inputList[0];
        if (!input) {
          continue;
        }
        const field = input.fieldRow.find((i) => i && Array.isArray(i.menuGenerator_));
        if (!field) {
          continue;
        }
        field.menuGenerator_ = appendKeys(
          defaultKeys ? [...defaultKeys] : field.menuGenerator_,
          block.type === "event_whenkeypressed", "event_whenkeyhit"
        );
      }
    }
  };

  updateExistingBlocks();
  addon.settings.addEventListener("change", updateExistingBlocks);
  addon.self.addEventListener("disabled", updateExistingBlocks);
  addon.self.addEventListener("reenabled", updateExistingBlocks);
}
