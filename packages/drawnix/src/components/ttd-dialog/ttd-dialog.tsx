import { Dialog, DialogContent } from '../dialog/dialog';
import MermaidToDrawnix from './mermaid-to-drawnix';
import { DialogType, useDrawnix } from '../../hooks/use-drawnix';
import MarkdownToDrawnix from './markdown-to-drawnix';
import DrawnixToMarkdown from './drawnix-to-markdown';
import DrawnixToMermaid from './drawnix-to-mermaid';

export const TTDDialog = ({ container }: { container: HTMLElement | null }) => {
  const { appState, setAppState } = useDrawnix();
  return (
    <>
      <Dialog
        open={appState.openDialogType === DialogType.mermaidToDrawnix}
        onOpenChange={(open) => {
          setAppState({
            ...appState,
            openDialogType: open ? DialogType.mermaidToDrawnix : null,
          });
        }}
      >
        <DialogContent className="Dialog ttd-dialog" container={container}>
          <MermaidToDrawnix></MermaidToDrawnix>
        </DialogContent>
      </Dialog>
      <Dialog
        open={appState.openDialogType === DialogType.markdownToDrawnix}
        onOpenChange={(open) => {
          setAppState({
            ...appState,
            openDialogType: open ? DialogType.markdownToDrawnix : null,
          });
        }}
      >
        <DialogContent className="Dialog ttd-dialog" container={container}>
          <MarkdownToDrawnix></MarkdownToDrawnix>
        </DialogContent>
      </Dialog>
      <Dialog
        open={appState.openDialogType === DialogType.drawnixToMarkdown}
        onOpenChange={(open) => {
          setAppState({
            ...appState,
            openDialogType: open ? DialogType.drawnixToMarkdown : null,
          });
        }}
      >
        <DialogContent className="Dialog ttd-dialog" container={container}>
          <DrawnixToMarkdown></DrawnixToMarkdown>
        </DialogContent>
      </Dialog>
      <Dialog
        open={appState.openDialogType === DialogType.drawnixToMermaid}
        onOpenChange={(open) => {
          setAppState({
            ...appState,
            openDialogType: open ? DialogType.drawnixToMermaid : null,
          });
        }}
      >
        <DialogContent className="Dialog ttd-dialog" container={container}>
          <DrawnixToMermaid></DrawnixToMermaid>
        </DialogContent>
      </Dialog>
    </>
  );
};
