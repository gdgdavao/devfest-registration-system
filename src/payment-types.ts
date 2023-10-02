export interface PaymentMethod {
    id: string
    label: string
    processorRate: number
    extraProcessorFee: number
}

export interface PaymentIntent {
    id:         string;
    type:       string;
    attributes: Attributes;
}

export interface Attributes {
    amount:                 number;
    capture_type:           string;
    client_key:             string;
    currency:               string;
    description:            null;
    livemode:               boolean;
    statement_descriptor:   string;
    status:                 string;
    last_payment_error:     null;
    payment_method_allowed: string[];
    next_action:            NextAction;
    payment_method_options: PaymentMethodOptions;
    metadata:               Metadata;
    setup_future_usage:     null;
    created_at:             number;
    updated_at:             number;
}

export interface Metadata {
    email:   string;
    user_id: string;
}

export interface NextAction {
    type:     string;
    redirect: Redirect;
}

export interface Redirect {
    url:        string;
    return_url: string;
}

export interface PaymentMethodOptions {
    card: Card;
}

export interface Card {
    request_three_d_secure: string;
}
