import Dialog from "./dialog";
import Button from "./Button/button";
import { useTranslations } from "next-intl";
interface Props {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onClose: Function;
  onConfirm: Function;
}
export default function Confirm(props: Props) {
  const { open, onClose, title, children, onConfirm } = props;
  const t = useTranslations("TransactionsPage");

  if (!open) {
    return <></>;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className="text-xl">{title}</h2>
      <div className="py-5">{children}</div>
      <div className="flex justify-end">
        <div className="p-1">
          <Button
            onClick={() => onClose()}
            className="bg-red-600 hover:bg-red-300"
          >
            {t("delete.cancelButton")}
          </Button>
        </div>
        <div className="p-1">
          <Button
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="bg-primary-600 hover:bg-primary-300"
          >
            {t("delete.deleteButton")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
