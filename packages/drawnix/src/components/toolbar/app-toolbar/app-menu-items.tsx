import {
  ExportImageIcon,
  ExportPDFIcon,
  ExportMarkdownIcon,
  ExportMermaidIcon,
  GithubIcon,
  OpenFileIcon,
  SaveFileIcon,
  TrashIcon,
} from '../../icons';
import { useBoard, useListRender } from '@plait-board/react-board';
import {
  BoardTransforms,
  PlaitBoard,
  PlaitElement,
  PlaitTheme,
  ThemeColorMode,
  Viewport,
} from '@plait/core';
import { loadFromJSON, saveAsJSON } from '../../../data/json';
import MenuItem from '../../menu/menu-item';
import MenuItemLink from '../../menu/menu-item-link';
import { saveAsImage } from '../../../utils/image';
import { saveAsPDF } from '../../../utils/pdf';
import { useDrawnix } from '../../../hooks/use-drawnix';
import { DialogType } from '../../../hooks/use-drawnix';
import Menu from '../../menu/menu';
import { useContext } from 'react';
import { MenuContentPropsContext } from '../../menu/common';
import { EVENT } from '../../../constants';

export const SaveToFile = () => {
  const board = useBoard();
  return (
    <MenuItem
      data-testid="save-button"
      onSelect={() => {
        saveAsJSON(board);
      }}
      icon={SaveFileIcon}
      aria-label={`${`保存文件`}`}
      shortcut={`Cmd+S`}
    >{`保存文件`}</MenuItem>
  );
};
SaveToFile.displayName = 'SaveToFile';

export const OpenFile = () => {
  const board = useBoard();
  const listRender = useListRender();
  const clearAndLoad = (
    value: PlaitElement[],
    viewport?: Viewport,
    theme?: PlaitTheme
  ) => {
    board.children = value;
    board.viewport = viewport || { zoom: 1 };
    board.theme = theme || { themeColorMode: ThemeColorMode.default };
    listRender.update(board.children, {
      board: board,
      parent: board,
      parentG: PlaitBoard.getElementHost(board),
    });
    BoardTransforms.fitViewport(board);
  };
  return (
    <MenuItem
      data-testid="open-button"
      onSelect={() => {
        loadFromJSON(board).then((data) => {
          clearAndLoad(data.elements, data.viewport);
        });
      }}
      icon={OpenFileIcon}
      aria-label={`${`打开`}`}
    >{`打开`}</MenuItem>
  );
};
OpenFile.displayName = 'OpenFile';

export const SaveAsImage = () => {
  const board = useBoard();
  const menuContentProps = useContext(MenuContentPropsContext);
  return (
    <MenuItem
      icon={ExportImageIcon}
      data-testid="image-export-button"
      onSelect={() => {
        saveAsImage(board, true).catch(console.error);
      }}
      submenu={
        <Menu onSelect={() => {
          const itemSelectEvent = new CustomEvent(EVENT.MENU_ITEM_SELECT, {
            bubbles: true,
            cancelable: true,
          });
          menuContentProps.onSelect?.(itemSelectEvent);
        }}>
          <MenuItem
            onSelect={() => {
              saveAsImage(board, true).catch(console.error);
            }}
            aria-label={'透明背景'}
          >
            PNG
          </MenuItem>
          <MenuItem
            onSelect={() => {
              saveAsImage(board, false).catch(console.error);
            }}
            aria-label={'白色背景'}
          >
            JPG
          </MenuItem>
        </Menu>
      }
      shortcut={`Cmd+Shift+E`}
      aria-label={''}
    >
      {'导出图片'}
    </MenuItem>
  );
};
SaveAsImage.displayName = 'SaveAsImage';

export const SaveAsPDF = () => {
  const board = useBoard();
  const menuContentProps = useContext(MenuContentPropsContext);
  return (
    <MenuItem
      icon={ExportPDFIcon}
      data-testid="pdf-export-button"
      onSelect={() => {
        saveAsPDF(board, { quality: 'medium' }).catch(console.error);
      }}
      submenu={
        <Menu onSelect={() => {
          const itemSelectEvent = new CustomEvent(EVENT.MENU_ITEM_SELECT, {
            bubbles: true,
            cancelable: true,
          });
          menuContentProps.onSelect?.(itemSelectEvent);
        }}>
          <MenuItem
            onSelect={() => {
              saveAsPDF(board, { orientation: 'landscape', format: 'a4', quality: 'medium' }).catch(console.error);
            }}
            aria-label={'横向A4 (推荐)'}
          >
            横向 A4 (推荐)
          </MenuItem>
          <MenuItem
            onSelect={() => {
              saveAsPDF(board, { orientation: 'portrait', format: 'a4', quality: 'medium' }).catch(console.error);
            }}
            aria-label={'纵向A4'}
          >
            纵向 A4
          </MenuItem>
          <MenuItem
            onSelect={() => {
              saveAsPDF(board, { orientation: 'landscape', format: 'a4', quality: 'low' }).catch(console.error);
            }}
            aria-label={'快速导出 (小文件)'}
          >
            快速导出 (小文件)
          </MenuItem>
          <MenuItem
            onSelect={() => {
              saveAsPDF(board, { orientation: 'landscape', format: 'a4', quality: 'high' }).catch(console.error);
            }}
            aria-label={'高质量 (大文件)'}
          >
            高质量 (大文件)
          </MenuItem>
          <MenuItem
            onSelect={() => {
              saveAsPDF(board, { orientation: 'landscape', format: 'a3', quality: 'medium' }).catch(console.error);
            }}
            aria-label={'横向A3'}
          >
            横向 A3
          </MenuItem>
        </Menu>
      }
      shortcut={`Cmd+Shift+P`}
      aria-label={'导出PDF'}
    >
      {'导出PDF'}
    </MenuItem>
  );
};
SaveAsPDF.displayName = 'SaveAsPDF';

export const CleanBoard = () => {
  const { appState, setAppState } = useDrawnix();
  return (
    <MenuItem
      icon={TrashIcon}
      data-testid="reset-button"
      onSelect={() => {
        setAppState({
          ...appState,
          openCleanConfirm: true,
        });
      }}
      shortcut={`Cmd+Backspace`}
      aria-label={'清除画布'}
    >
      {'清除画布'}
    </MenuItem>
  );
};
CleanBoard.displayName = 'CleanBoard';

export const Socials = () => {
  return (
    <MenuItemLink
      icon={GithubIcon}
      href="https://github.com/plait-board/drawnix"
      aria-label="GitHub"
    >
      GitHub
    </MenuItemLink>
  );
};
Socials.displayName = 'Socials';

export const ExportToMarkdown = () => {
  const { appState, setAppState } = useDrawnix();
  return (
    <MenuItem
      icon={ExportMarkdownIcon}
      data-testid="markdown-export-button"
      onSelect={() => {
        setAppState({
          ...appState,
          openDialogType: DialogType.drawnixToMarkdown,
        });
      }}
      shortcut={`Cmd+Shift+M`}
      aria-label={'导出为 Markdown'}
    >
      {'导出为 Markdown'}
    </MenuItem>
  );
};
ExportToMarkdown.displayName = 'ExportToMarkdown';

export const ExportToMermaid = () => {
  const { appState, setAppState } = useDrawnix();
  return (
    <MenuItem
      icon={ExportMermaidIcon}
      data-testid="mermaid-export-button"
      onSelect={() => {
        setAppState({
          ...appState,
          openDialogType: DialogType.drawnixToMermaid,
        });
      }}
      shortcut={`Cmd+Shift+D`}
      aria-label={'导出为 Mermaid'}
    >
      {'导出为 Mermaid'}
    </MenuItem>
  );
};
ExportToMermaid.displayName = 'ExportToMermaid';
