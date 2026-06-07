type query = string;
type book = {
    id: number;
    title: string;
    description: string;
}

type chatUserType = {
    id: number;
    name: string;
    messages: Array<{userId: number, text: string}>;
}