import { MouseEvent, ReactNode, FC } from "react";

type ButtonProps = {
  disabled: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
};

const SwapButton: FC<ButtonProps> = ({ disabled, onClick, children }) => {
  return (
    <button className='swapButton' disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default SwapButton;
