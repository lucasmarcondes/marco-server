import { AppError, AppResponse } from '../helpers/response'
import nodemailer from 'nodemailer'
import { IUserDocument, IUserToken } from 'types'
import { EMAIL_SENT_MSG } from '../constants'

export default class ConfirmationEmail {
	email: string
	title: string
	description: string
	btnLabel: string
	link: string
	body: string
	constructor(email: string, title: string, description: string, btnLabel: string, link: string) {
		this.email = email
		this.title = title
		this.description = description
		this.btnLabel = btnLabel
		this.link = link
		this.body = `<td
		style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top;display:block;width:600px;max-width:600px;margin:0 auto!important"
		valign='top'
		width='600'
	>
		<div style='auto;padding:10px box-sizing:border-box;display:block;max-width:600px;margin:0'>
			<div style='solid box-sizing:border-box;width:100%;margin-bottom:30px;background:#ffffff;border:1px #f0f0f0'>
				<table style='box-sizing:border-box;width:100%;border-spacing:0;border-collapse:separate!important' width='100%'>
					<tbody>
						<tr>
							<td
								style="box-sizing:border-box;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top;padding:30px"
								valign='top'
							>
								<table style='box-sizing:border-box;width:100%;border-spacing:0;border-collapse:separate!important' width='100%'>
									<tbody>
										<tr>
											<td
												style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top"
												valign='top'
											>
												<h2 style="margin:0;margin-bottom:30px;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-weight:300;line-height:1.5;font-size:24px;color:#294661!important">
													${this.title}
												</h2>

												<p style="margin:0;margin-bottom:30px;color:#294661;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300">
													<strong>
														<a href='mailto:${this.email}' target='_blank'>
															${this.email}
														</a>
													</strong>
												</p>

												<p style="margin:0;margin-bottom:30px;color:#294661;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;font-weight:300">
													<small>${this.description}</small>
												</p>
											</td>
										</tr>
										<tr>
											<td
												style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top"
												valign='top'
											>
												<table
													cellpadding='0'
													cellspacing='0'
													style='box-sizing:border-box;border-spacing:0;width:100%;border-collapse:separate!important'
													width='100%'
												>
													<tbody>
														<tr>
															<td
																align='center'
																style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top;padding-bottom:15px"
																valign='top'
															>
																<table
																	cellpadding='0'
																	cellspacing='0'
																	style='box-sizing:border-box;border-spacing:0;width:auto;border-collapse:separate!important'
																>
																	<tbody>
																		<tr>
																			<td
																				align='center'
																				bgcolor='#348eda'
																				style="box-sizing:border-box;padding:0;font-family:'Open Sans','Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;font-size:16px;vertical-align:top;background-color:#348eda;border-radius:2px;text-align:center"
																				valign='top'
																			>
																				<a
																					href='${process.env.URL}${this.link}'
																					style='box-sizing:border-box;border-color:#348eda;font-weight:400;text-decoration:none;display:inline-block;margin:0;color:#ffffff;background-color:#348eda;border:solid 1px #348eda;border-radius:2px;font-size:14px;padding:12px 45px'
																					target='_blank'
																				>
																					${this.btnLabel}
																				</a>
																			</td>
																		</tr>
																	</tbody>
																</table>
															</td>
														</tr>
													</tbody>
												</table>
											</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</td>`
	}
}

let sendGridTransport = require('nodemailer-sendgrid-transport')
export const transporter = nodemailer.createTransport(
	sendGridTransport({
		auth: {
			api_key: process.env.SENDGRID_API,
		},
	})
)

export const sendResetPasswordEmail = async (user: IUserDocument, userToken: IUserToken): Promise<AppResponse> => {
	return transporter
		.sendMail({
			to: user.email,
			from: 'eric@marcondes.me',
			subject: 'Reset Password',
			html: new ConfirmationEmail(
				user.email,
				`Hello ${user.firstName}, <br>A request has been recieved to reset your password.`,
				'',
				'Reset Password',
				`/new-password/${userToken.token}`
			).body,
		})
		.then(resp => {
			return new AppResponse(200, EMAIL_SENT_MSG)
		})
		.catch(err => {
			throw new AppError(500, err.message)
		})
}

export const sendVerifyEmail = async (user: IUserDocument, userToken: IUserToken): Promise<AppResponse> => {
	return transporter
		.sendMail({
			to: user.email,
			from: 'eric@marcondes.me',
			subject: 'Please Verify Your Email',
			html: new ConfirmationEmail(
				user.email,
				'Please verify your email address.',
				'Your link is active for 24 hours. After that, you will need to resend the verification email.',
				'Verify Email',
				`/email-verification/${userToken.token}`
			).body,
		})
		.then(resp => {
			return new AppResponse(200, EMAIL_SENT_MSG)
		})
		.catch(err => {
			throw new AppError(500, err.message)
		})
}
